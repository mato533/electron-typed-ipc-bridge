import { ipcMain } from 'electron'

import { API_CHANNEL_MAP, getApiChannelMap, MODE } from './channel'
import { AbstractLogger, initialiseMain as initialise, mainLogger as log } from './utils/logger'

import type { BrowserWindow } from 'electron'
import type {
  IpcBridgeApiFunction,
  IpcBridgeApiImplementation,
  IpcBridgeApiHandler,
  IpcBridgeApiOnFunction,
  IpcBridgeApiOnHandler,
  IpcBridgeApiMode,
  IpcBridgeApiInvokeFunction,
} from './channel'

const isApiFunction = (value: unknown): value is IpcBridgeApiFunction => {
  return typeof value === 'function' ? true : false
}

type IpcBridgeApiEmitterTypeConverter<T extends IpcBridgeApiOnHandler> = {
  [K in keyof T]: T[K] extends IpcBridgeApiFunction
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends (...args: infer Args) => any
      ? (window: BrowserWindow, ...args: Args) => void
      : never
    : T[K] extends IpcBridgeApiHandler
      ? IpcBridgeApiEmitterTypeConverter<T[K]>
      : never
}

export type IpcBridgeApiEmitterGenerator<T extends IpcBridgeApiImplementation> =
  'on' extends keyof T
    ? T['on'] extends undefined
      ? undefined
      : T['on'] extends IpcBridgeApiOnHandler
        ? {
            send: IpcBridgeApiEmitterTypeConverter<T['on']>
          }
        : never
    : undefined

function registerIpcHandler(ipcBridgeApi: IpcBridgeApiImplementation): void {
  createhandler(ipcBridgeApi, MODE.invoke)
}

function getIpcBridgeApiEmitter<T extends IpcBridgeApiImplementation>(
  ipcBridgeApi: T
): IpcBridgeApiEmitterGenerator<T>
function getIpcBridgeApiEmitter(ipcBridgeApi: IpcBridgeApiImplementation) {
  return createhandler(ipcBridgeApi, MODE.on)
}
function createhandler(ipcBridgeApi: IpcBridgeApiImplementation, mode: IpcBridgeApiMode) {
  const channelMap = getApiChannelMap(ipcBridgeApi)

  let _mode: IpcBridgeApiMode
  const _registerIpcHandler = (
    api: IpcBridgeApiHandler = ipcBridgeApi,
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
        log.info(
          _mode === MODE.invoke
            ? 'IpcBridgeAPI registration is stated.'
            : 'Generateing IpcBrigeApi Emitter is started'
        )
      }
      const senderKey = level === 0 ? 'send' : key
      const _path = path.concat([key])

      if (typeof apiInfo[key] === 'object' && !isApiFunction(api[key])) {
        log.debug(`${'  '.repeat(level)} - ${key}`)
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
        log.debug(`${'  '.repeat(level)} - ${key} (channel: ${apiInfo[key]})`)
        switch (_mode) {
          case MODE.invoke: {
            const _api = api[key] as IpcBridgeApiInvokeFunction
            ipcMain.handle(apiInfo[key], (...args) => {
              log.silly(`called from renderer: ${_path.join('.')} (channel: ${apiInfo[key]})`)
              return _api(...args)
            })
            break
          }
          case MODE.on: {
            const _api = api[key] as IpcBridgeApiOnFunction
            sender[senderKey] = (window: BrowserWindow, ...args: Parameters<typeof _api>) => {
              log.silly(`send to renderer: ${_path.join('.')} (channel::${apiInfo[key]})`)
              window.webContents.send(apiInfo[key], _api(...args))
            }
            break
          }
          default:
            log.error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
            throw new Error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
        }
      } else {
        log.error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
        throw new Error(`implimentation error: ${_path.join('.')} (channel::${apiInfo[key]})`)
      }
    })

    if (level === 0) {
      log.debug(`Finish`)
    }
    return sender
  }
  if (mode === MODE.invoke) {
    log.debug(`API handler for channel map is resistred (channel: ${API_CHANNEL_MAP})`)
    ipcMain.handle(API_CHANNEL_MAP, () => channelMap)
  }
  return _registerIpcHandler()
}

export { registerIpcHandler, getIpcBridgeApiEmitter, initialise, AbstractLogger }
