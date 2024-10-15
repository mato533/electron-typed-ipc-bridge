import type { IpcContextBridgeApi } from '../preload'
import type { IpcBridgeApiSenderTypeGenerator } from '../main'
import type { IpcBridgeApiImplementation } from '../channel'

export type { IpcBridgeApiTypeGenerator } from '../preload'

export type { IpcBridgeApiSenderTypeGenerator } from '../main'

export function registerIpcHandler<T extends IpcBridgeApiImplementation>(
  ipcBridgeApi: T
): IpcBridgeApiSenderTypeGenerator<T>

export function getApiInvoker<
  T extends IpcContextBridgeApi<IpcBridgeApiImplementation>,
>(): Promise<T>
