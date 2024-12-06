export type LogLevel = 'info' | 'warn' | 'error' | 'verbose' | 'debug' | 'silly'

const PACKAGE_NAME = 'ipc-bridge'

const LOG_LEVEL = {
  info: 'info',
  warn: 'warn',
  error: 'error',
  verbose: 'verbose',
  debug: 'debug',
  silly: 'silly',
} as const

interface Logger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  verbose(message: string): void
  debug(message: string): void
  silly(message: string): void
}

abstract class ProcessType {
  constructor(
    protected type: string = (this.type = process.type === 'browser' ? 'main' : process.type)
  ) {}
}

abstract class AbstractLogger extends ProcessType implements Logger {
  protected isEnabled: boolean
  constructor(option = { isEnabled: true }) {
    super()
    this.isEnabled = option.isEnabled
  }
  info(message: string) {
    this._writeLog(LOG_LEVEL.info, message)
  }

  warn(message: string) {
    this._writeLog(LOG_LEVEL.warn, message)
  }

  error(message: string) {
    this._writeLog(LOG_LEVEL.error, message)
  }

  verbose(message: string) {
    this._writeLog(LOG_LEVEL.verbose, message)
  }

  debug(message: string) {
    this._writeLog(LOG_LEVEL.debug, message)
  }

  silly(message: string) {
    this._writeLog(LOG_LEVEL.silly, message)
  }
  protected _writeLog(level: LogLevel, message: string) {
    if (!this.isEnabled) {
      return
    }
    const _message = `[${PACKAGE_NAME}] [${this.type}] ${message}`
    this.writeLog(level, _message)
  }
  protected abstract writeLog(level: LogLevel, message: string): void
}

class DefaultLogger extends AbstractLogger {
  protected writeLog(level: LogLevel, message: string): void {
    switch (level) {
      case LOG_LEVEL.info:
      case LOG_LEVEL.warn:
        console.log(message)
        break

      case LOG_LEVEL.error:
        console.error(message)
        break

      case LOG_LEVEL.verbose:
      case LOG_LEVEL.debug:
      case LOG_LEVEL.silly:
        console.debug(message)
        break
    }
  }
}

let mainLogger: Logger = new DefaultLogger()
let preloadLogger: Logger = new DefaultLogger()

type MainOption = {
  logger?: {
    main?: Logger
  }
}
type PreloadOption = {
  logger?: {
    preload?: Logger
  }
}

const getLogger = (logger: Logger | undefined) => {
  if (logger) {
    return logger
  } else {
    return new DefaultLogger({ isEnabled: false })
  }
}

// todo: remove this method on next major version
const oldInitializeMain = (option: MainOption = {}) => {
  initializeMain(option)
  mainLogger.warn(
    "⚠️ [DEPRECATION NOTICE] This method ('initialise') will be REMOVED on next major version."
  )
}

// todo: remove this method on next major version
const oldInitializePreload = (option: PreloadOption = {}) => {
  initializePreload(option)
  preloadLogger.warn(
    "⚠️ [DEPRECATION NOTICE] This method ('initialise') will be REMOVED on next major version."
  )
}

const initializeMain = (option: MainOption = {}) => {
  if (option.logger) {
    mainLogger = getLogger(option.logger.main)
  }
}
const initializePreload = (option: PreloadOption = {}) => {
  if (option.logger) {
    preloadLogger = getLogger(option.logger.preload)
  }
}
export {
  Logger,
  AbstractLogger,
  DefaultLogger,
  MainOption,
  PreloadOption,
  LOG_LEVEL,
  initializeMain,
  initializePreload,
  mainLogger,
  preloadLogger,
  // todo: remove this method on next major version
  oldInitializeMain,
  oldInitializePreload,
}
