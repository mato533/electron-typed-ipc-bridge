import {
  AbstractLogger,
  DefaultLogger,
  LOG_LEVEL,
  mainLogger,
  preloadLogger,
  initialiseMain,
  initialisePreload,
} from '../utils/logger'

import type { LogLevel } from '../utils/logger'

const getLogger = (procName: string) => {
  switch (procName) {
    case 'main':
      return mainLogger

    case 'preload':
      return preloadLogger
  }
}
describe.each([
  ['main', initialiseMain],
  ['preload', initialisePreload],
])('Logger (%s)', (procName: string, initialise) => {
  describe('DefaultLogger', () => {
    const errorSpy = vi.spyOn(console, 'error')
    const debugSpy = vi.spyOn(console, 'debug')
    const logSpy = vi.spyOn(console, 'log')

    beforeEach(() => {
      errorSpy.mockReset()
      debugSpy.mockReset()
      logSpy.mockReset()
    })

    it('disable', () => {
      initialise({ logger: {} })
      getLogger(procName).info('TEST')
      expect(logSpy).not.toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
    })

    it.each([
      ['info', logSpy],
      ['warn', logSpy],
      ['error', errorSpy],
      ['verbose', debugSpy],
      ['debug', debugSpy],
      ['silly', debugSpy],
    ])('Assert output the log at each log level (%s)', (logLevel, spy) => {
      initialise({ logger: { [procName]: new DefaultLogger() } })
      getLogger(procName)[logLevel]('TEST')
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Assert output the log at each log level', () => {
    const logMock = vi.fn()
    class Logger extends AbstractLogger {
      protected writeLog(level: LogLevel, message: string): void {
        logMock(level, message)
      }
    }
    beforeEach(() => {
      logMock.mockReset()
      initialise({ logger: { [procName]: new Logger() } })
    })

    it.each([...Object.keys(LOG_LEVEL)])('logger test (%s)', (logLevel) => {
      getLogger(procName)[logLevel]('TEST')
      expect(logMock).toHaveBeenCalled()
    })
  })
})
