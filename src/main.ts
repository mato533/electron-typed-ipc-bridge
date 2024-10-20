import { ipcMain } from 'electron'

import { API_CHANNEL_MAP, getApiChannelMap, MODE } from './channel'

import type { BrowserWindow } from 'electron'
import type {
  ApiFunction,
  IpcBridgeApiImplementation,
  ApiHandler,
  ApiOnFunction,
  ApiOnHandler,
  ApiMode,
} from './channel'

const isApiFunction = (value: unknown): value is ApiFunction => {
  return typeof value === 'function' ? true : false
}

type IpcBridgeApiSenderTypeConverter<T extends ApiOnHandler> = {
  [K in keyof T]: T[K] extends ApiFunction
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends (...args: infer Args) => any
      ? (window: BrowserWindow, ...args: Args) => void
      : never
    : T[K] extends ApiHandler
      ? IpcBridgeApiSenderTypeConverter<T[K]>
      : never
}

export type IpcBridgeApiEmitterTypeGenerator<T extends IpcBridgeApiImplementation> =
  'on' extends keyof T
    ? T['on'] extends undefined
      ? undefined
      : T['on'] extends ApiOnHandler
        ? {
            send: IpcBridgeApiSenderTypeConverter<T['on']>
          }
        : never
    : undefined

function registerIpcHandler<T extends IpcBridgeApiImplementation>(ipcBridgeApi: T): void
function registerIpcHandler(ipcBridgeApi: IpcBridgeApiImplementation) {
  createhandler(ipcBridgeApi, MODE.invoke)
}

function getIpcApiEmitter<T extends IpcBridgeApiImplementation>(
  ipcBridgeApi: T
): IpcBridgeApiEmitterTypeGenerator<T>
function getIpcApiEmitter(ipcBridgeApi: IpcBridgeApiImplementation) {
  return createhandler(ipcBridgeApi, MODE.on)
}
function createhandler(ipcBridgeApi: IpcBridgeApiImplementation, mode: ApiMode) {
  const channelMap = getApiChannelMap(ipcBridgeApi)

  let _mode: ApiMode
  const _registerIpcHandler = (api: ApiHandler = ipcBridgeApi, apiInfo = channelMap, level = 0) => {
    const keys = Object.keys(apiInfo)
    if (level === 0) {
      console.debug('IpcBridgeAPI registration is stated.')
    }
    const sender = {}
    keys.forEach((key) => {
      if (level === 0) {
        _mode = MODE[key]
        if (MODE[key] !== mode) {
          return
        }
      }
      const senderKey = level === 0 ? 'send' : key

      if (typeof apiInfo[key] === 'object' && !isApiFunction(api[key])) {
        console.debug(`${'  '.repeat(level)} - ${key}`)
        switch (_mode) {
          case MODE.invoke:
            _registerIpcHandler(api[key], apiInfo[key], level + 1)
            break
          case MODE.on:
            sender[senderKey] = _registerIpcHandler(api[key], apiInfo[key], level + 1)
            break
          default:
            throw new Error(`implimentation error: ${apiInfo[key]}`)
        }
      } else if (typeof apiInfo[key] !== 'object' && isApiFunction(api[key])) {
        console.debug(`${'  '.repeat(level)} - ${key} (chanel: ${apiInfo[key]})`)
        switch (_mode) {
          case MODE.invoke:
            ipcMain.handle(apiInfo[key], api[key])
            break
          case MODE.on: {
            const _api = api[key] as ApiOnFunction
            console.log(`=====${key}`)
            sender[senderKey] = (window: BrowserWindow, ...args: Parameters<typeof _api>) => {
              window.webContents.send(apiInfo[key], _api(...args))
            }
            break
          }
          default:
            throw new Error(`implimentation error: ${apiInfo[key]}`)
        }
      } else {
        throw new Error(`implimentation error: ${apiInfo[key]}`)
      }
    })

    if (level === 0) {
      console.debug(`  --> Finish`)
    }
    return sender
  }
  if (mode === MODE.invoke) {
    ipcMain.handle(API_CHANNEL_MAP, () => channelMap)
  }
  return _registerIpcHandler()
}

export { registerIpcHandler, getIpcApiEmitter }
