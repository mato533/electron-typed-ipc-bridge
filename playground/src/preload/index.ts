/* eslint-disable @typescript-eslint/ban-ts-comment */
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AbstractLogger, getApiInvoker, initialise } from 'electron-typed-ipc-bridge/preload'

import type { LogLevel } from 'electron-typed-ipc-bridge/preload'
import type { IpcBridgeApi } from '../main/api'

// Custom APIs for renderer
class MyLogger extends AbstractLogger {
  protected writeLog(level: LogLevel, message: string): void {
    console.log(`[${level}] ${message}`)
  }
}

initialise({ logger: { preload: new MyLogger() } })
// if disable looging, pass the empty object
// initialise({ logger: {} })
const api = await getApiInvoker<IpcBridgeApi>()

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
