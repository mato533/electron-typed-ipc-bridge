import { ipcRenderer } from 'electron'

import { API_CHANNEL_MAP, MODE } from './channel'
import {
  AbstractLogger,
  initializePreload as initialize,
  // todo: remove this method on next major version
  oldInitializePreload as initialise,
  preloadLogger as log,
} from './utils/logger'

import type { IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { IpcBridgeApiHandler, IpcBridgeApiImplementation } from './channel'

type IpcBridgeApiChannelMap = {
  [key: string]: string | IpcBridgeApiChannelMap
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Awaitable<T> = T extends Promise<any> ? T : Promise<T>

type IpcBridgeApiFunction<F> = F extends (event: IpcMainInvokeEvent, ...args: infer Args) => infer R
  ? (...args: Args) => Awaitable<R>
  : never

type IpcBridgeApiInvoker<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? IpcBridgeApiFunction<T[K]> : IpcBridgeApiInvoker<T[K]>
}

type IpcBridgeApiReceiver<T> = {
  [K in keyof T]: T[K] extends IpcBridgeApiHandler
    ? IpcBridgeApiReceiver<T[K]>
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends (...args: any[]) => infer R
      ? (callback: (event: IpcRendererEvent, args: R) => void) => void
      : never
}

type IpcBridgeApiGenerator<T extends IpcBridgeApiImplementation> = keyof T extends never
  ? undefined
  : 'on' extends keyof T
    ? 'invoke' extends keyof T
      ? {
          invoke: IpcBridgeApiInvoker<T['invoke']>
          on: IpcBridgeApiReceiver<T['on']>
        }
      : {
          on: IpcBridgeApiReceiver<T['on']>
        }
    : {
        invoke: IpcBridgeApiInvoker<T['invoke']>
      }

type IpcBridgeApiTypeGenerator<T extends IpcBridgeApiImplementation> =
  | {
      invoke: IpcBridgeApiInvoker<T['invoke']>
      on: IpcBridgeApiReceiver<T['on']>
    }
  | {
      on: IpcBridgeApiReceiver<T['on']>
    }
  | {
      invoke: IpcBridgeApiInvoker<T['invoke']>
    }

type IpcBridgeApi = IpcBridgeApiTypeGenerator<IpcBridgeApiImplementation>

const generateIpcBridgeApi = async <T extends IpcBridgeApi>(): Promise<T> => {
  const result = await ipcRenderer.invoke(API_CHANNEL_MAP)
  if (!result) {
    log.error(`  --> Failed to get mapping for api and channel `)
    throw new Error(`'electron-typed-ipc-bridge' is not working correctly`)
  }
  log.info('Generation IpcBridgeAPI is stated.')

  const endpoint = getEndpointApi(result) as T

  log.info(`Finish`)

  return endpoint
}

const getEndpointApi = (apiChannelMap: IpcBridgeApiChannelMap, path: string[] = []) => {
  return Object.keys(apiChannelMap).reduce((endpoint, key) => {
    const channel = apiChannelMap[key]
    const _path = path.concat(key)

    if (typeof channel === 'object') {
      log.debug(`${'  '.repeat(path.length)} - ${key}`)
      endpoint[key] = getEndpointApi(channel, _path)
    } else {
      endpoint[key] = createIpcBridgeApi(channel, _path)
    }

    return endpoint
  }, {})
}
const createIpcBridgeApi = (channel: string, path: string[]) => {
  log.debug(`${'  '.repeat(path.length)} - ${path.slice(-1)[0]} (channel: ${channel})`)
  switch (path[0]) {
    case MODE.invoke:
      return createInvoker(channel, path)
    case MODE.on:
      return createReceiver(channel, path)
    default: {
      const message = `implementation error: ${path.join('.')} (channel: ${channel}`
      log.error(message)
      throw new Error(message)
    }
  }
}

const createInvoker = (channel: string, path: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    log.silly(`calling from renderer: ${path.join('.')} (channel: ${channel})`)
    return ipcRenderer.invoke(channel, ...args)
  }
}
const createReceiver = (channel: string, path: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (callback: (event: IpcRendererEvent, arg0: any) => void) =>
    ipcRenderer.on(channel, (event, value) => {
      log.silly(`receive message from main: ${path.join('.')} (channel: ${channel})`)
      callback(event, value)
    })
}

export {
  generateIpcBridgeApi,
  initialize,
  // todo: remove this method on next major version
  initialise,
  AbstractLogger,
}
export type {
  IpcBridgeApiFunction,
  IpcBridgeApiInvoker,
  IpcBridgeApiGenerator,
  IpcBridgeApiTypeGenerator,
}
