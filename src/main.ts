import { ipcMain } from 'electron'

import { API_CHANNEL_MAP, getApiChannelMap, MODE } from './channel'
import { AbstractLogger, initialise, mainLogger } from './utils/logger'

import type { BrowserWindow } from 'electron'
import type {
  ApiFunction,
  IpcBridgeApiImplementation,
  ApiHandler,
  ApiOnFunction,
  ApiOnHandler,
  ApiMode,
  ApiInvokeFunction,
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
  const _registerIpcHandler = (
    api: ApiHandler = ipcBridgeApi,
    apiInfo = channelMap,
    level = 0,
    path: string[] = []
  ) => {
    const keys = Object.keys(apiInfo)
    const sender = {}
    keys.forEach((key) => {
      if (level === 0) {
        _mode = MODE[key]
        if (MODE[key] !== mode) {
          return
        }
      }
      if (level === 0) {
        mainLogger.info(
          _mode === MODE.invoke
            ? 'IpcBridgeAPI registration is stated.'
            : 'Generateing IpcBrigeApi Emitter is started'
        )
      }
      const senderKey = level === 0 ? 'send' : key
      const _path = path.concat([key])

      if (typeof apiInfo[key] === 'object' && !isApiFunction(api[key])) {
        mainLogger.debug(`${'  '.repeat(level)} - ${key}`)
        switch (_mode) {
          case MODE.invoke:
            _registerIpcHandler(api[key], apiInfo[key], level + 1, _path)
            break
          case MODE.on:
            sender[senderKey] = _registerIpcHandler(api[key], apiInfo[key], level + 1, _path)
            break
          default:
            throw new Error(`implimentation error: ${apiInfo[key]}`)
        }
      } else if (typeof apiInfo[key] !== 'object' && isApiFunction(api[key])) {
        mainLogger.debug(`${'  '.repeat(level)} - ${key} (chanel: ${apiInfo[key]})`)
        switch (_mode) {
          case MODE.invoke: {
            const _api = api[key] as ApiInvokeFunction
            ipcMain.handle(apiInfo[key], (...args) => {
              mainLogger.silly(`called from renderer: ${_path.join('.')} (channel:${apiInfo[key]})`)
              return _api(...args)
            })
            break
          }
          case MODE.on: {
            const _api = api[key] as ApiOnFunction
            sender[senderKey] = (window: BrowserWindow, ...args: Parameters<typeof _api>) => {
              mainLogger.silly(`send to renderer: ${_path.join('.')} (channel::${apiInfo[key]})`)
              window.webContents.send(apiInfo[key], _api(...args))
            }
            break
          }
          default:
            mainLogger.error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
            throw new Error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
        }
      } else {
        mainLogger.error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
        throw new Error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
      }
    })

    if (level === 0) {
      mainLogger.debug(`Finish`)
    }
    return sender
  }
  if (mode === MODE.invoke) {
    mainLogger.debug(`API handler for channel map is resistred (chanel: ${API_CHANNEL_MAP})`)
    ipcMain.handle(API_CHANNEL_MAP, () => channelMap)
  }
  return _registerIpcHandler()
}

export { registerIpcHandler, getIpcApiEmitter, initialise, AbstractLogger }
