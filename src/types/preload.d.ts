import type { IpcBridgeApiTypeGenerator } from '../preload'
import type { IpcBridgeApiImplementation } from '../channel'
import type { PreloadOption as Option, LogLevel } from '../utils/logger'

export { AbstractLogger } from '.'

/**
 * Generate IPC api that will be exposed to renderer process.
 * Use at the preload sctipt
 */
declare function generateIpcBridgeApi<
  T extends IpcBridgeApiTypeGenerator<IpcBridgeApiImplementation>,
>(): Promise<T>

declare function initialise(option: Option): void

export { generateIpcBridgeApi, initialise }
export type { LogLevel }
