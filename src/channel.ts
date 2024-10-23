import { genUUID } from './utils/uuid'

import type { IpcMainInvokeEvent } from 'electron'

export const API_CHANNEL_MAP = `06675f7b-d88f-a064-d3ba-6a60dcbc091c` as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IpcBridgeApiOnFunction = (...args: any[]) => any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IpcBridgeApiInvokeFunction = (event: IpcMainInvokeEvent, ...args: any[]) => any

export type IpcBridgeApiOnHandler = {
  readonly [key: string]: IpcBridgeApiOnFunction | IpcBridgeApiOnHandler
}
export type IpcBridgeApiInvokeHandler = {
  readonly [key: string]: IpcBridgeApiInvokeFunction | IpcBridgeApiInvokeHandler
}

export type IpcBridgeApiHandler = IpcBridgeApiInvokeHandler | IpcBridgeApiOnHandler
export type IpcBridgeApiFunction = IpcBridgeApiInvokeFunction | IpcBridgeApiOnFunction

export type IpcBridgeApiImplementation = {
  on?: IpcBridgeApiOnHandler
  invoke?: IpcBridgeApiInvokeHandler
}

type IpcBridgeApiChannelMapItem = {
  [key: string]: string | IpcBridgeApiChannelMapItem
}

type IpcBridgeApiChannelMapItemTypeGenerator<T extends IpcBridgeApiHandler> = {
  [K in keyof T]: T[K] extends IpcBridgeApiFunction
    ? string
    : T[K] extends IpcBridgeApiHandler
      ? IpcBridgeApiChannelMapItemTypeGenerator<T[K]>
      : never
}

export type IpcBridgeApiChannelMapGenerator<T extends IpcBridgeApiImplementation> = {
  on: IpcBridgeApiChannelMapItemTypeGenerator<T['on']>
  invoke: IpcBridgeApiChannelMapItemTypeGenerator<T['invoke']>
}

let channelMap = undefined

export function haveSameStructure<T extends IpcBridgeApiImplementation>(
  obj1: T,
  obj2: IpcBridgeApiChannelMapGenerator<T>
) {
  if (!obj1 || !obj2) {
    return false
  }
  if (typeof obj1 === 'function' && typeof obj2 === 'string') {
    return true
  }
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false
  }

  const keys1 = [...Object.keys(obj1)]
  const keys2 = [...Object.keys(obj2)]

  if (keys1.length !== keys2.length) {
    return false
  }

  return keys1.every((key) => keys2.includes(key) && haveSameStructure(obj1[key], obj2[key]))
}

function getApiChannelMap<T extends IpcBridgeApiImplementation>(
  apiHandlers: T
): IpcBridgeApiChannelMapGenerator<T>
function getApiChannelMap(apiHandlers: IpcBridgeApiImplementation) {
  if (channelMap && haveSameStructure(apiHandlers, channelMap)) {
    return channelMap
  }

  const _getApiChannelMap = (apiHandler: IpcBridgeApiHandler) => {
    const channelMap: IpcBridgeApiChannelMapItem = {}
    Object.keys(apiHandler).forEach((key) => {
      if (typeof apiHandler[key] === 'object') {
        channelMap[key] = _getApiChannelMap(apiHandler[key])
      } else {
        channelMap[key] = genUUID()
      }
    })
    return channelMap
  }
  channelMap = _getApiChannelMap(apiHandlers)
  return channelMap
}

const MODE = {
  invoke: 0,
  on: 1,
} as const

export type IpcBridgeApiMode = (typeof MODE)[keyof typeof MODE]

export { getApiChannelMap, MODE }
