import { ipcRenderer } from 'electron'

import { API_CHANNEL_MAP, MODE } from './channel'

import type { IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { ApiHandler, IpcBridgeApiImplementation, ApiMode } from './channel'

type ApiChannelMap = {
  [key: string]: string | ApiChannelMap
}

export type RemoveEventArg<F> = F extends (
  event: IpcMainInvokeEvent,
  ...args: infer Args
) => infer R
  ? (...args: Args) => R
  : never

export type IpcBridgeApiInvoker<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? RemoveEventArg<T[K]>
    : IpcBridgeApiInvoker<T[K]>
}

// export type IpcBridgeApiInvoker = IpcBridgeApiInvokerTypeGenerator<ApiHandler>

type IpcBridgeApiReciver<T> = {
  [K in keyof T]: T[K] extends ApiHandler
    ? IpcBridgeApiReciver<T[K]>
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends (...args: any[]) => infer R
      ? (callback: (event: IpcRendererEvent, args: R) => void) => void
      : never
}

export type IpcBridgeApiTypeGenerator<T extends IpcBridgeApiImplementation> = keyof T extends never
  ? undefined
  : 'on' extends keyof T
    ? 'invoke' extends keyof T
      ? {
          invoke: IpcBridgeApiInvoker<T['invoke']>
          on: IpcBridgeApiReciver<T['on']>
        }
      : {
          on: IpcBridgeApiReciver<T['on']>
        }
    : {
        invoke: IpcBridgeApiInvoker<T['invoke']>
      }

export type IpcContextBridgeApi<T extends IpcBridgeApiImplementation> =
  | {
      invoke: IpcBridgeApiInvoker<T['invoke']>
      on: IpcBridgeApiReciver<T['on']>
    }
  | {
      on: IpcBridgeApiReciver<T['on']>
    }
  | {
      invoke: IpcBridgeApiInvoker<T['invoke']>
    }

function getApiInvoker<T extends IpcContextBridgeApi<IpcBridgeApiImplementation>>(): Promise<T>
async function getApiInvoker() {
  console.debug('Generation IpcBridgeAPI Invoker is stated.')
  const result = await ipcRenderer.invoke(API_CHANNEL_MAP)
  if (!result) {
    console.debug(`  --> Faild to get mapping for api and channel `)
    throw new Error(`'electron-context-bridge' is not working correctly`)
  }

  let mode: ApiMode
  const _getApiInvoker = (apiChannelMap: ApiChannelMap, level = 0) => {
    const apiInvoker = {}
    Object.keys(apiChannelMap).forEach((key) => {
      if (level === 0) {
        mode = MODE[key]
      }

      const value = apiChannelMap[key]
      if (typeof value === 'object') {
        console.debug(`${'  '.repeat(level)} - ${key}`)
        apiInvoker[key] = _getApiInvoker(value, level + 1)
      } else {
        console.debug(`${'  '.repeat(level)} - ${key} (chanel: ${value})`)
        switch (mode) {
          case MODE.invoke:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiInvoker[key] = (...args: any[]) => {
              return ipcRenderer.invoke(value, ...args)
            }
            break
          case MODE.on:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiInvoker[key] = (callback: (event: IpcRendererEvent, arg0: any) => void) =>
              ipcRenderer.on(value, (event, value) => callback(event, value))
            break
          default:
            throw new Error(`implimentation error: ${value}`)
        }
      }
    })
    if (level === 0) {
      console.debug(`  --> Finish`)
    }
    return apiInvoker
  }
  return _getApiInvoker(result)
}

export { getApiInvoker }
