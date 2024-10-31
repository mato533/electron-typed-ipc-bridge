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
  IpcBridgeApiInvokeFunction,
  IpcBridgeApiChannelMapItemTypeGenerator,
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

type IpcBridgeApiEmitterGenerator<T extends IpcBridgeApiImplementation> = 'on' extends keyof T
  ? T['on'] extends undefined
    ? undefined
    : T['on'] extends IpcBridgeApiOnHandler
      ? {
          send: IpcBridgeApiEmitterTypeConverter<T['on']>
        }
      : never
  : undefined

type ChannelMap = IpcBridgeApiChannelMapItemTypeGenerator<IpcBridgeApiImplementation>

const registerIpcHandler = (ipcBridgeApi: IpcBridgeApiImplementation): void => {
  const channelMap = getApiChannelMap(ipcBridgeApi)

  log.info('IpcBridgeAPI registration is stated.')
  log.debug(`API handler for channel map is resistred (channel: ${API_CHANNEL_MAP})`)
  ipcMain.handle(API_CHANNEL_MAP, () => channelMap)

  serializeApi(ipcBridgeApi[MODE.invoke], channelMap[MODE.invoke], [MODE.invoke])

  log.debug(`Finish`)
}

const getIpcBridgeApiEmitter = <T extends IpcBridgeApiImplementation>(
  ipcBridgeApi: T
): IpcBridgeApiEmitterGenerator<T> => {
  const channelMap = getApiChannelMap(ipcBridgeApi)

  log.info('Generateing IpcBrigeApi Emitter is started')
  const emmiterApi = serializeApi(ipcBridgeApi[MODE.on], channelMap[MODE.on], [MODE.on])

  log.debug(`Finish`)
  return { send: emmiterApi } as IpcBridgeApiEmitterGenerator<T>
}

const addHandler = (channel: string, handler: IpcBridgeApiInvokeFunction, path: string[]) => {
  ipcMain.handle(channel, (...args) => {
    log.silly(`called from renderer: ${path.join('.')} (channel: ${channel})`)
    return handler(...args)
  })
}

const createEmitter = (channel: string, onFunction: IpcBridgeApiOnFunction, path: string[]) => {
  return (window: BrowserWindow, ...args: Parameters<typeof onFunction>) => {
    log.silly(`send to renderer: ${path.join('.')} (channel: ${channel})`)
    window.webContents.send(channel, onFunction(...args))
  }
}

const getCallback = (mode: string) => {
  switch (mode) {
    case MODE.on:
      return createEmitter
    case MODE.invoke:
      return addHandler
    default: {
      const mssage = `Implimentation error: Top level is must be 'on' or 'invoke'. (${mode})`
      log.error(mssage)
      throw new Error(mssage)
    }
  }
}

const serializeApi = (
  ipcBridgeApi: IpcBridgeApiHandler,
  channelMap: ChannelMap,
  path: string[]
) => {
  const callback = getCallback(path[0])

  return Object.keys(channelMap).reduce((api, key) => {
    const _path = path.concat(key)
    if (isApiFunction(ipcBridgeApi[key])) {
      log.debug(`${'  '.repeat(path.length)} - ${key} (channel: ${channelMap[key]})`)
      api[key] = callback(channelMap[key], ipcBridgeApi[key], _path)
    } else {
      log.debug(`${'  '.repeat(path.length)} - ${key}`)
      api[key] = serializeApi(ipcBridgeApi[key], channelMap[key], _path)
    }
    return api
  }, {})
}

export {
  registerIpcHandler,
  getIpcBridgeApiEmitter,
  initialise,
  AbstractLogger,
  type IpcBridgeApiEmitterGenerator,
}
