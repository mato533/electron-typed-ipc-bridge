import { getContextMenuHandler } from './showContextMenu'

import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type {
  IpcBridgeApiEmitterGenerator,
  IpcBridgeApiGenerator,
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
      },
    },
    showContextMenu: getContextMenuHandler(),
    emitEvent: (_: IpcMainInvokeEvent) => {
      if (emitter && mainWindow) {
        emitter.send.updateCounter(mainWindow, 1)
      }
    },
  },
  on: {
    updateCounter: (value: number) => value,
  },
}
type IpcBridgeApiEmitter = IpcBridgeApiEmitterGenerator<typeof api>
type IpcBridgeApi = IpcBridgeApiGenerator<typeof api>

let mainWindow: BrowserWindow | undefined = undefined
let emitter: IpcBridgeApiEmitter | undefined = undefined
const setInstanceOfMain = (window: BrowserWindow, api: IpcBridgeApiEmitter) => {
  mainWindow = window
  emitter = api
}

export { setInstanceOfMain, type IpcBridgeApiEmitter, type IpcBridgeApi }
