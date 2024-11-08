import { haveSameStructure } from './utils/checker'
import { genUUID } from './utils/uuid'

import type { IpcMainInvokeEvent } from 'electron'

const API_CHANNEL_MAP = `06675f7b-d88f-a064-d3ba-6a60dcbc091c` as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IpcBridgeApiOnFunction = (...args: any[]) => any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IpcBridgeApiInvokeFunction = (event: IpcMainInvokeEvent, ...args: any[]) => any

type IpcBridgeApiOnHandler = {
  readonly [key: string]: IpcBridgeApiOnFunction | IpcBridgeApiOnHandler
}
type IpcBridgeApiInvokeHandler = {
  readonly [key: string]: IpcBridgeApiInvokeFunction | IpcBridgeApiInvokeHandler
}

type IpcBridgeApiHandler = IpcBridgeApiInvokeHandler | IpcBridgeApiOnHandler
type IpcBridgeApiFunction = IpcBridgeApiInvokeFunction | IpcBridgeApiOnFunction

type IpcBridgeApiImplementation = {
  on?: IpcBridgeApiOnHandler
  invoke?: IpcBridgeApiInvokeHandler
}

type IpcBridgeApiChannelMapItemTypeGenerator<T extends IpcBridgeApiHandler> = {
  [K in keyof T]: T[K] extends IpcBridgeApiFunction
    ? string
    : T[K] extends IpcBridgeApiHandler
      ? IpcBridgeApiChannelMapItemTypeGenerator<T[K]>
      : never
}
type IpcBridgeApiCommonGenerator<T, OnType, InvokeType> = 'on' extends keyof T
  ? 'invoke' extends keyof T
    ? {
        on: OnType
        invoke: InvokeType
      }
    : {
        on: OnType
      }
  : {
      invoke: InvokeType
    }

type IpcBridgeApiChannelMapGenerator<T extends IpcBridgeApiImplementation> =
  IpcBridgeApiCommonGenerator<
    T,
    IpcBridgeApiChannelMapItemTypeGenerator<T['on']>,
    IpcBridgeApiChannelMapItemTypeGenerator<T['invoke']>
  >
let channelMap = undefined

const generateChannelMap = (apiHandler: IpcBridgeApiHandler) => {
  return Object.keys(apiHandler).reduce((channelMap, key) => {
    if (typeof apiHandler[key] === 'object') {
      channelMap[key] = generateChannelMap(apiHandler[key])
    } else {
      channelMap[key] = genUUID()
    }
    return channelMap
  }, {})
}
const getApiChannelMap = <T extends IpcBridgeApiImplementation>(
  apiHandlers: T
): IpcBridgeApiChannelMapGenerator<T> => {
  if (channelMap && haveSameStructure(apiHandlers, channelMap)) {
    return channelMap
  }

  channelMap = generateChannelMap(apiHandlers)
  return channelMap as IpcBridgeApiChannelMapGenerator<T>
}

const MODE = {
  invoke: 'invoke',
  on: 'on',
} as const

export { getApiChannelMap, API_CHANNEL_MAP, MODE }
export type {
  // main only
  IpcBridgeApiOnFunction,
  IpcBridgeApiInvokeFunction,
  IpcBridgeApiOnHandler,
  IpcBridgeApiChannelMapItemTypeGenerator,

  // preload only
  IpcBridgeApiCommonGenerator,

  // main, preload
  IpcBridgeApiHandler,
  IpcBridgeApiFunction,
  IpcBridgeApiImplementation,

  // other
  IpcBridgeApiChannelMapGenerator, // checker
}
