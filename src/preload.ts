import { ipcRenderer } from 'electron'

import { API_CHANNEL_MAP, MODE } from './channel'
import {
  AbstractLogger,
  initialisePreload as initialise,
  preloadLogger as log,
} from './utils/logger'

import type { IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { IpcBridgeApiHandler, IpcBridgeApiImplementation, IpcBridgeApiMode } from './channel'

type IpcBridgeApiChannelMap = {
  [key: string]: string | IpcBridgeApiChannelMap
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? IpcBridgeApiFunction<T[K]> : IpcBridgeApiInvoker<T[K]>
}

type IpcBridgeApiReciver<T> = {
  [K in keyof T]: T[K] extends IpcBridgeApiHandler
    ? IpcBridgeApiReciver<T[K]>
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends (...args: any[]) => infer R
      ? (callback: (event: IpcRendererEvent, args: R) => void) => void
      : never
}

export type IpcBridgeApiGenerator<T extends IpcBridgeApiImplementation> = keyof T extends never
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

export type IpcBridgeApiTypeGenerator<T extends IpcBridgeApiImplementation> =
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

function generateIpcBridgeApi<
  T extends IpcBridgeApiTypeGenerator<IpcBridgeApiImplementation>,
>(): Promise<T>
async function generateIpcBridgeApi() {
  log.info('Generation IpcBridgeAPI is stated.')
  const result = await ipcRenderer.invoke(API_CHANNEL_MAP)
  if (!result) {
    log.error(`  --> Faild to get mapping for api and channel `)
    throw new Error(`'electron-typed-ipc-bridge' is not working correctly`)
  }

  let mode: IpcBridgeApiMode
  const _getApiInvoker = (
    apiChannelMap: IpcBridgeApiChannelMap,
    level = 0,
    path: string[] = []
  ) => {
    const apiInvoker = {}
    Object.keys(apiChannelMap).forEach((key) => {
      if (level === 0) {
        mode = MODE[key]
      }

      const channel = apiChannelMap[key]
      const _path = path.concat([key])
      if (typeof channel === 'object') {
        log.debug(`${'  '.repeat(level)} - ${key}`)
        apiInvoker[key] = _getApiInvoker(channel, level + 1, _path)
      } else {
        log.debug(`${'  '.repeat(level)} - ${key} (channel: ${channel})`)
        switch (mode) {
          case MODE.invoke:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiInvoker[key] = (...args: any[]) => {
              log.silly(`calling from renderer: ${_path.join('.')} (channel: ${channel})`)
              return ipcRenderer.invoke(channel, ...args)
            }
            break
          case MODE.on:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiInvoker[key] = (callback: (event: IpcRendererEvent, arg0: any) => void) =>
              ipcRenderer.on(channel, (event, value) => {
                log.silly(`recive message from main: ${_path.join('.')} (channel: ${channel})`)
                callback(event, value)
              })
            break
          default:
            log.error(`implimentation error: ${_path.join('.')} (channel: ${channel}`)
            throw new Error(`implimentation error: ${_path.join('.')} (channel: ${channel}`)
        }
      }
    })
    if (level === 0) {
      log.info(`Finish`)
    }
    return apiInvoker
  }
  return _getApiInvoker(result)
}

export { generateIpcBridgeApi, initialise, AbstractLogger }
