import { genUUID } from './utils/uuid'

import type { IpcMainInvokeEvent } from 'electron'

export const API_CHANNEL_MAP = `06675f7b-d88f-a064-d3ba-6a60dcbc091c` as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiOnFunction = (...args: any[]) => any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiInvokeFunction = (event: IpcMainInvokeEvent, ...args: any[]) => any

export type ApiOnHandler = {
  readonly [key: string]: ApiOnFunction | ApiOnHandler
}
export type ApiInvokeHandler = {
  readonly [key: string]: ApiInvokeFunction | ApiInvokeHandler
}

export type ApiHandler = ApiInvokeHandler | ApiOnHandler
export type ApiFunction = ApiInvokeFunction | ApiOnFunction

export type IpcBridgeApiImplementation = {
  on?: ApiOnHandler
  invoke?: ApiInvokeHandler
}

type ApiChannelMapItem = {
  [key: string]: string | ApiChannelMapItem
}

type ApiChannelMapItemTypeGenerator<T extends ApiHandler> = {
  [K in keyof T]: T[K] extends ApiFunction
    ? string
    : T[K] extends ApiHandler
      ? ApiChannelMapItemTypeGenerator<T[K]>
      : never
}

export type ApiChannelMapGenerator<T extends IpcBridgeApiImplementation> = {
  on: ApiChannelMapItemTypeGenerator<T['on']>
  invoke: ApiChannelMapItemTypeGenerator<T['invoke']>
}

let channelMap = undefined

export function haveSameStructure<T extends IpcBridgeApiImplementation>(
  obj1: T,
  obj2: ApiChannelMapGenerator<T>
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
): ApiChannelMapGenerator<T>
function getApiChannelMap(apiHandlers: IpcBridgeApiImplementation) {
  if (channelMap && haveSameStructure(apiHandlers, channelMap)) {
    return channelMap
  }

  const _getApiChannelMap = (apiHandler: ApiHandler) => {
    const channelMap: ApiChannelMapItem = {}
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
export type ApiMode = (typeof MODE)[keyof typeof MODE]

export { getApiChannelMap, MODE }
