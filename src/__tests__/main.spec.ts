import { API_CHANNEL_MAP } from '../channel'
import { registerIpcHandler } from '../main'

import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'

describe('main', () => {
  const mocks = vi.hoisted(() => {
    return {
      ipcMain: { handle: vi.fn() },
      randomUUID: vi.fn().mockImplementation(() => {
        const counter = mocks.randomUUID.mock.calls.length
        return `uuid-${counter}`
      }),
    }
  })
  vi.mock('electron', () => {
    return {
      ipcMain: mocks.ipcMain,
    }
  })

  // disable console outputs
  vi.spyOn(console, 'debug').mockImplementation(() => {})

  it('Proper call of ipcMain.handle', () => {
    const apiHandlers = {
      invoke: {
        fn1: (e: IpcMainInvokeEvent) => console.log(e),
        fn2: (_e: IpcMainInvokeEvent) => `hello`,
        name1: {
          fn1: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
          fn2: (e: IpcMainInvokeEvent) => console.log(e),
        },
      },
      on: {
        fn1: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
      },
    }

    registerIpcHandler(apiHandlers)

    expect(mocks.ipcMain.handle.mock.calls.length).toBe(5)
    const lastArgs = mocks.ipcMain.handle.mock.calls[0]
    expect(lastArgs[0]).toBe(API_CHANNEL_MAP)

    const ipcBridgeApiChannelGetter = lastArgs[1]
    const channelMap = ipcBridgeApiChannelGetter()

    expect(mocks.ipcMain.handle).toBeCalled()
    expect(mocks.ipcMain.handle).toBeCalledTimes(5)
    expect(mocks.ipcMain.handle).toHaveBeenNthCalledWith(
      2,
      channelMap.invoke.fn1,
      apiHandlers.invoke.fn1
    )
    expect(mocks.ipcMain.handle).toHaveBeenNthCalledWith(
      3,
      channelMap.invoke.fn2,
      apiHandlers.invoke.fn2
    )
    expect(mocks.ipcMain.handle).toHaveBeenNthCalledWith(
      4,
      channelMap.invoke.name1.fn1,
      apiHandlers.invoke.name1.fn1
    )
    expect(mocks.ipcMain.handle).toHaveBeenNthCalledWith(
      5,
      channelMap.invoke.name1.fn2,
      apiHandlers.invoke.name1.fn2
    )
  })
  afterEach(() => {
    mocks.ipcMain.handle.mockClear()
  })

  it('sender test', () => {
    const _apiHandlers = {
      invoke: {
        fn1: (e: IpcMainInvokeEvent) => console.log(e),
        fn2: (_e: IpcMainInvokeEvent) => `hello`,
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

    const mockSend = vi.fn()
    const browserWindow = {
      webContents: {
        send: mockSend,
      },
    } as unknown as BrowserWindow
    const api = registerIpcHandler(_apiHandlers)

    const lastArgs = mocks.ipcMain.handle.mock.calls[0]
    expect(lastArgs[0]).toBe(API_CHANNEL_MAP)

    const ipcBridgeApiChannelGetter = lastArgs[1]
    const channelMap = ipcBridgeApiChannelGetter()

    api.send.fn2(browserWindow, 1, 2)
    expect(mockSend).toBeCalled()
    expect(mockSend).toHaveBeenLastCalledWith(channelMap.on.fn2, 3)
  })
})
