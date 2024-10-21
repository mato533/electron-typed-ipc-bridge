import { getContextMenuHandler } from './showContextMenu'

import type { IpcMainInvokeEvent } from 'electron'
import type {
  IpcBridgeApiSenderTypeGenerator,
  IpcBridgeApiTypeGenerator
} from 'electron-typed-ipc-bridge'

export const api = {
  invoke: {
    ping: () => console.log('pong'),
    culc: {
      add: async (_event: IpcMainInvokeEvent, arg0: number, arg1: number) => {
        console.log(`arg0: ${arg0}, arg1:${arg1}`)
        return arg0 + arg1
      },
      minus: async (_event: IpcMainInvokeEvent, arg0: number, arg1: number) => {
        console.log(`arg0: ${arg0}, arg1: ${arg1}`)
        return arg0 - arg1
      }
    },
    showContextMenu: getContextMenuHandler()
  },
  on: {
    updateCounter: (value: number) => value
  }
}

export type IpcSenderType = IpcBridgeApiSenderTypeGenerator<typeof api>
export type IpcBridgeApi = IpcBridgeApiTypeGenerator<typeof api>
