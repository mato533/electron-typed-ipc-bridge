import { getContextMenuHandler } from './showContextMenu'

import type { IpcMainInvokeEvent } from 'electron'
import type {
  IpcBridgeApiEmitterGenerator,
  IpcBridgeApiGenerator
} from 'electron-typed-ipc-bridge/main'

export const api = {
  invoke: {
    ping: () => console.log('pong'),
    culc: {
      add: (_event: IpcMainInvokeEvent, arg0: number, arg1: number) => {
        console.log(`arg0: ${arg0}, arg1:${arg1}`)
        return arg0 + arg1
      },
      minus: (_event: IpcMainInvokeEvent, arg0: number, arg1: number) => {
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

export type IpcBridgeApiEmitter = IpcBridgeApiEmitterGenerator<typeof api>
export type IpcBridgeApi = IpcBridgeApiGenerator<typeof api>
