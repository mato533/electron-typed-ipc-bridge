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
import type {
  IpcBridgeApiCommonGenerator,
  IpcBridgeApiHandler,
  IpcBridgeApiImplementation,
} from './channel'

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
  : IpcBridgeApiCommonGenerator<T, IpcBridgeApiReceiver<T['on']>, IpcBridgeApiInvoker<T['invoke']>>

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

const requiredKeys = ['on', 'invoke'] as const

const hasRequiredKeys = (keys: string[]) => {
  if (!requiredKeys.some((key) => keys.includes(key))) {
    throw new Error()
  }
}

const checkInvalidKeys = (keys: string[]) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (!keys.every((key) => requiredKeys.includes(key))) {
    throw new Error()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkTopLevelKeys = (channelMap: any) => {
  try {
    const keys = Object.keys(channelMap)

    hasRequiredKeys(keys)

    checkInvalidKeys(keys)
  } catch (_) {
    const message = `Implementation error: Top level must be 'on' or 'invoke'. Both properties are not set.`
    log.error(message)
    throw new Error(message)
  }
}

const generateIpcBridgeApi = async <T extends IpcBridgeApi>(): Promise<T> => {
  const result = await ipcRenderer.invoke(API_CHANNEL_MAP)
  if (!result) {
    log.error(`  --> Failed to get mapping for api and channel `)
    throw new Error(`'electron-typed-ipc-bridge' is not working correctly`)
  }
  checkTopLevelKeys(result)

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
  }
}

const createInvoker = (channel: string, path: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    log.silly(`calling from renderer: ${path.join('.')} (channel: ${channel})`)
    return ipcRenderer.invoke(channel, ...args)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (event: IpcRendererEvent, arg0: any) => void

const createListener = (channel: string, path: string[], callback: Callback) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (event: IpcRendererEvent, value: any) => {
    log.silly(`receive message from main: ${path.join('.')} (channel: ${channel})`)
    callback(event, value)
  }
}

const createReceiver = (channel: string, path: string[]) => {
  return (callback: Callback) => ipcRenderer.on(channel, createListener(channel, path, callback))
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
