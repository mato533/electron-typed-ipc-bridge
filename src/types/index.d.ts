import type { IpcContextBridgeApi } from '../preload'
import type { IpcBridgeApiEmitterTypeGenerator } from '../main'
import type { IpcBridgeApiImplementation } from '../channel'

/**
 * Type generator for api that will be exposed to renderer process
 * Use at the preload sctipt
 */
export type { IpcBridgeApiTypeGenerator } from '../preload'

/**
 * Type generator for api to send message from main to renderer
 * Use at the main process
 */
export type { IpcBridgeApiEmitterTypeGenerator as IpcBridgeApiSenderTypeGenerator } from '../main'

/**
 * Resister IPC handler(for tow way)
 * and generate api for send message to renderer process
 * Use at the main process
 * @param ipcBridgeApi Implementation for IPC api handlers
 */
export function registerIpcHandler<T extends IpcBridgeApiImplementation>(ipcBridgeApi: T): void

export function getIpcApiEmitter<T extends IpcBridgeApiImplementation>(
  ipcBridgeApi: T
): IpcBridgeApiEmitterTypeGenerator<T>
/**
 * Generate IPC api that will be exposed to renderer process.
 * Use at the preload sctipt
 */
export function getApiInvoker<
  T extends IpcContextBridgeApi<IpcBridgeApiImplementation>,
>(): Promise<T>
