import type { ElectronAPI } from '@electron-toolkit/preload'
import type { IpcBridgeApi } from '../main/api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IpcBridgeApi
  }
}
