import { generateIpcBridgeApi } from '../preload'
import { API_CHANNEL_MAP } from '../channel'
import { registerIpcHandler } from '../main'

import type { IpcBridgeApiGenerator } from '../preload'
import type { IpcMainInvokeEvent, IpcRendererEvent } from 'electron'

const _apiHandlers = {
  invoke: {
    fn1: (e: IpcMainInvokeEvent) => console.log(e),
    fn2: (_e: IpcMainInvokeEvent, arg0: string) => `hello ${arg0}`,
  },
  on: {
    fn1: (arg1: string) => arg1,
    fn2: (arg1: number, arg2: number) => arg1 + arg2,
    name1: {
      fn2: (arg1: string) => arg1,
      fn1: (arg1: number, arg2: number) => arg1 + arg2,
    },
  },
}
describe('preload', () => {
  const mocks = vi.hoisted(() => {
    return {
      ipcMain: { handle: vi.fn() },
      randomUUID: vi.fn().mockImplementation(() => {
        const counter = mocks.randomUUID.mock.calls.length
        return `uuid-${counter}`
      }),
      ipcRenderer: {
        invoke: vi.fn(),
        on: vi.fn(),
      },
    }
  })
  vi.mock('electron', () => {
    return {
      ipcMain: mocks.ipcMain,
      ipcRenderer: mocks.ipcRenderer,
    }
  })

  // disable console outputs
  vi.spyOn(console, 'debug').mockImplementation(() => {})
  beforeEach(() => {
    mocks.ipcMain.handle.mockReset()
    mocks.ipcRenderer.invoke.mockReset()
    mocks.ipcRenderer.on.mockReset()
    mocks.randomUUID.mockReset()
  })
  it('sender test', async () => {
    registerIpcHandler(_apiHandlers)

    const lastArgs = mocks.ipcMain.handle.mock.calls[0]
    expect(lastArgs[0]).toBe(API_CHANNEL_MAP)

    const ipcBridgeApiChannelGetter = lastArgs[1]
    const channelMap = ipcBridgeApiChannelGetter()
    mocks.ipcRenderer.invoke.mockImplementation((key: string) => {
      if (key === API_CHANNEL_MAP) {
        return channelMap
      }
    })
    const _apiPreload = await generateIpcBridgeApi<IpcBridgeApiGenerator<typeof _apiHandlers>>()
    _apiPreload.invoke.fn2('BOB')
    expect(mocks.ipcRenderer.invoke).toHaveBeenLastCalledWith(channelMap.invoke.fn2, 'BOB')

    let result: number
    const callback = vi
      .fn()
      .mockImplementation((_e: IpcRendererEvent, value: number) => (result = value))
    _apiPreload.on.fn2(callback)
    expect(mocks.ipcRenderer.on).toHaveBeenLastCalledWith(
      channelMap.on.fn2,
      mocks.ipcRenderer.on.mock.calls[0][1]
    )
    // simulate call from main (arg1: event, arg2: return for api)
    const expectedValue = 3
    mocks.ipcRenderer.on.mock.calls[0][1]({}, expectedValue)

    // test
    expect(callback).toHaveBeenCalledOnce()
    expect(result).toBe(expectedValue)
  })

  it('error test', async () => {
    mocks.ipcRenderer.invoke.mockImplementation((key: string) => {
      if (key === API_CHANNEL_MAP) {
        return undefined
      }
    })

    expect(() =>
      generateIpcBridgeApi<IpcBridgeApiGenerator<typeof _apiHandlers>>()
    ).rejects.toThrowError('electron-typed-ipc-bridge')
  })
  it('error test', async () => {
    mocks.ipcRenderer.invoke.mockImplementation((key: string) => {
      if (key === API_CHANNEL_MAP) {
        return {
          invalid: { api: 'uuid' },
        }
      }
    })

    expect(() =>
      generateIpcBridgeApi<IpcBridgeApiGenerator<typeof _apiHandlers>>()
    ).rejects.toThrowError('Implementation error')
  })

  it('error test', async () => {
    mocks.ipcRenderer.invoke.mockImplementation((key: string) => {
      if (key === API_CHANNEL_MAP) {
        return {
          on: { api: 'uuid1a' },
          invalid: { api: 'uuid2' },
        }
      }
    })

    expect(() =>
      generateIpcBridgeApi<IpcBridgeApiGenerator<typeof _apiHandlers>>()
    ).rejects.toThrowError('Implementation error')
  })
})
