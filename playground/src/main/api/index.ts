import { getContextMenuHandler } from './showContextMenu'

import type {
  IpcBridgeApiSenderTypeGenerator,
  IpcBridgeApiTypeGenerator
} from 'electron-typed-ipc-bridge'

export const api = {
  invoke: {
    ping: () => console.log('pong'),
    showContextMenu: getContextMenuHandler()
  },
  on: {
    updateCounter: (value: number) => value
  }
}

export type IpcSenderType = IpcBridgeApiSenderTypeGenerator<typeof api>
export type IpcBridgeApi = IpcBridgeApiTypeGenerator<typeof api>
