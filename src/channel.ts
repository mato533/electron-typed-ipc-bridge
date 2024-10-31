import { haveSameStructure } from './utils/checker'
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

export type IpcBridgeApiChannelMapItemTypeGenerator<T extends IpcBridgeApiHandler> = {
  [K in keyof T]: T[K] extends IpcBridgeApiFunction
    ? string
    : T[K] extends IpcBridgeApiHandler
      ? IpcBridgeApiChannelMapItemTypeGenerator<T[K]>
      : never
}

export type IpcBridgeApiChannelMapGenerator<T extends IpcBridgeApiImplementation> =
  'on' extends keyof T
    ? 'invoke' extends keyof T
      ? {
          on: IpcBridgeApiChannelMapItemTypeGenerator<T['on']>
          invoke: IpcBridgeApiChannelMapItemTypeGenerator<T['invoke']>
        }
      : {
          on: IpcBridgeApiChannelMapItemTypeGenerator<T['on']>
        }
    : {
        invoke: IpcBridgeApiChannelMapItemTypeGenerator<T['invoke']>
      }

let channelMap = undefined

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
  invoke: 'invoke',
  on: 'on',
} as const

export { getApiChannelMap, MODE }
