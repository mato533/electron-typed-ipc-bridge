import type { IpcContextBridgeApi } from '../preload'
import type { IpcBridgeApiEmitterTypeGenerator } from '../main'
import type { IpcBridgeApiImplementation } from '../channel'
import type { MainOption, PreloadOption, LogLevel, Logger } from '../utils/logger'

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

export type { MainOption, PreloadOption, LogLevel } from '../utils/logger'
export function initialise(option: MainOption): void
export function initialise(option: PreloadOption): void

export abstract class AbstractLogger implements Logger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  verbose(message: string): void
  debug(message: string): void
  silly(message: string): void
  protected abstract writeLog(level: LogLevel, message: string): void
}
