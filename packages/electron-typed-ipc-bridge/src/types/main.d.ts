import type { IpcBridgeApiEmitterGenerator } from '../main'
import type { IpcBridgeApiImplementation } from '../channel'
import type { MainOption as Option, LogLevel } from '../utils/logger'

/**
 * Type generator for api that will be exposed to renderer process
 * Use at the preload script
 */
export type { IpcBridgeApiGenerator } from '../preload'
/**
 * Type generator for api to send message from main to renderer
 * Use at the main process
 */
export type { IpcBridgeApiEmitterGenerator } from '../main'

export { AbstractLogger } from '.'

/**
 * Resister IPC handler(for tow way)
 * Use at the main process
 * @param ipcBridgeApi Implementation for IPC api handlers
 */
declare function registerIpcHandler(ipcBridgeApi: IpcBridgeApiImplementation): void

/**
 * Generate api for send message to renderer process.
 * Use at the main process
 * @param ipcBridgeApi Implementation for IPC api handlers
 */
declare function getIpcBridgeApiEmitter<T extends IpcBridgeApiImplementation>(
  ipcBridgeApi: T
): IpcBridgeApiEmitterGenerator<T>

declare function initialize(option: Option): void

// todo: remove this method on next major version
declare function initialise(option: Option): void

export {
  registerIpcHandler,
  getIpcBridgeApiEmitter,
  initialize,
  // todo: remove this method on next major version
  initialise,
}
export type { Option, LogLevel }
