import { ipcRenderer } from 'electron'

import { API_CHANNEL_MAP, MODE } from './channel'
import { AbstractLogger, initialisePreload as initialise, preloadLogger } from './utils/logger'

import type { IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { ApiHandler, IpcBridgeApiImplementation, ApiMode } from './channel'

type ApiChannelMap = {
  [key: string]: string | ApiChannelMap
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Awaitable<T> = T extends Promise<any> ? T : Promise<T>

export type IpcBridgeApiFunction<F> = F extends (
  event: IpcMainInvokeEvent,
  ...args: infer Args
) => infer R
  ? (...args: Args) => Awaitable<R>
  : never

export type IpcBridgeApiInvoker<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? IpcBridgeApiFunction<T[K]>
    : IpcBridgeApiInvoker<T[K]>
}

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
  preloadLogger.info('Generation IpcBridgeAPI is stated.')
  const result = await ipcRenderer.invoke(API_CHANNEL_MAP)
  if (!result) {
    preloadLogger.error(`  --> Faild to get mapping for api and channel `)
    throw new Error(`'electron-typed-ipc-bridge' is not working correctly`)
  }

  let mode: ApiMode
  const _getApiInvoker = (apiChannelMap: ApiChannelMap, level = 0, path: string[] = []) => {
    const apiInvoker = {}
    Object.keys(apiChannelMap).forEach((key) => {
      if (level === 0) {
        mode = MODE[key]
      }

      const channel = apiChannelMap[key]
      const _path = path.concat([key])
      if (typeof channel === 'object') {
        preloadLogger.debug(`${'  '.repeat(level)} - ${key}`)
        apiInvoker[key] = _getApiInvoker(channel, level + 1, _path)
      } else {
        preloadLogger.debug(`${'  '.repeat(level)} - ${key} (chanel: ${channel})`)
        switch (mode) {
          case MODE.invoke:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiInvoker[key] = (...args: any[]) => {
              preloadLogger.silly(`called from renderer: ${_path.join('.')} (chanel: ${channel})`)
              return ipcRenderer.invoke(channel, ...args)
            }
            break
          case MODE.on:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiInvoker[key] = (callback: (event: IpcRendererEvent, arg0: any) => void) =>
              ipcRenderer.on(channel, (event, value) => {
                preloadLogger.silly(
                  `recive message from main: ${_path.join('.')} (chanel: ${channel})`
                )
                callback(event, value)
              })
            break
          default:
            preloadLogger.error(`implimentation error: ${_path.join('.')} (chanel: ${channel}`)
            throw new Error(`implimentation error: ${_path.join('.')} (chanel: ${channel}`)
        }
      }
    })
    if (level === 0) {
      preloadLogger.info(`Finish`)
    }
    return apiInvoker
  }
  return _getApiInvoker(result)
}

export { getApiInvoker, initialise, AbstractLogger }
