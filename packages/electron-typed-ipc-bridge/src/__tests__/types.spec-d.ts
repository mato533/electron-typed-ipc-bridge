import type { BrowserWindow, IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { IpcBridgeApiFunction, IpcBridgeApiGenerator, IpcBridgeApiInvoker } from '../preload'
import type { IpcBridgeApiChannelMapGenerator } from '../channel'
import type { IpcBridgeApiEmitterGenerator } from '../main'

describe('Type check', () => {
  it('IpcBridgeApiFunction', () => {
    const _fn = (e: IpcMainInvokeEvent, arg1: string) => arg1
    type ExpectedApiType = (arg1: string) => Promise<string>

    expectTypeOf<ExpectedApiType>().toEqualTypeOf<IpcBridgeApiFunction<typeof _fn>>()
  })

  it('IpcBridgeApiInvoker', () => {
    const _apiHandlers = {
      fn1: (e: IpcMainInvokeEvent) => console.log(e),
      fn2: (_e: IpcMainInvokeEvent) => `hello`,
      name1: {
        fn1: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
        fn2: (e: IpcMainInvokeEvent) => console.log(e),
      },
    }

    type IpcBridgeApi = IpcBridgeApiInvoker<typeof _apiHandlers>
    type ExpectedType = {
      fn1: () => Promise<void>
      fn2: () => Promise<string>
      name1: {
        fn1: (arg1: string) => Promise<string>
        fn2: () => Promise<void>
      }
    }

    expectTypeOf<ExpectedType>().toEqualTypeOf<IpcBridgeApi>()
  })

  it('IpcBridgeApiChannelMapGenerator', () => {
    const _apiHandlers = {
      invoke: {
        fn1: (e: IpcMainInvokeEvent) => console.log(e),
        fn2: (_e: IpcMainInvokeEvent) => `hello`,
        name1: {
          fn1: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
          fn2: (e: IpcMainInvokeEvent) => console.log(e),
        },
      },
      on: {
        fn1: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
      },
    }

    type TestTarget = IpcBridgeApiChannelMapGenerator<typeof _apiHandlers>
    type ExpectedType = {
      invoke: {
        fn1: string
        fn2: string
        name1: {
          fn1: string
          fn2: string
        }
      }
      on: {
        fn1: string
      }
    }
    expectTypeOf<ExpectedType>().toEqualTypeOf<TestTarget>()
  })

  describe('IpcBridgeApiSenderTypeGenerator', () => {
    it('invoke and on is existed', () => {
      const _apiHandlers = {
        invoke: {
          fn1: (e: IpcMainInvokeEvent) => console.log(e),
          fn2: (_e: IpcMainInvokeEvent) => `hello`,
        },
        on: {
          fn1: (arg1: string) => arg1,
          fn2: (arg1: number, arg2: number) => arg1 + arg2,
          name1: {
            fn2: (arg1: string) => arg1,
            fn1: (arg1: number, arg2: number) => arg1 + arg2,
          },
        },
      }

      type TestTarget = IpcBridgeApiEmitterGenerator<typeof _apiHandlers>
      type ExpectedType = {
        send: {
          fn1: (window: BrowserWindow, arg1: string) => void
          fn2: (window: BrowserWindow, arg1: number, arg2: number) => void
          name1: {
            fn1: (window: BrowserWindow, arg1: number, arg2: number) => void
            fn2: (window: BrowserWindow, arg1: string) => void
          }
        }
      }
      expectTypeOf<ExpectedType>().toEqualTypeOf<TestTarget>()
    })

    it('only invoke is existed', () => {
      const _apiHandlers = {
        invoke: {
          fn1: (e: IpcMainInvokeEvent) => console.log(e),
          fn2: (_e: IpcMainInvokeEvent) => `hello`,
        },
      }

      type TestTarget = IpcBridgeApiEmitterGenerator<typeof _apiHandlers>

      expectTypeOf<undefined>().toEqualTypeOf<TestTarget>()
    })

    it('only on is existed', () => {
      const _apiHandlers = {
        on: {
          fn1: (arg1: string) => arg1,
          fn2: (arg1: number, arg2: number) => arg1 + arg2,
          name1: {
            fn2: (arg1: string) => arg1,
            fn1: (arg1: number, arg2: number) => arg1 + arg2,
          },
        },
      }

      type TestTarget = IpcBridgeApiEmitterGenerator<typeof _apiHandlers>
      type ExpectedType = {
        send: {
          fn1: (window: BrowserWindow, arg1: string) => void
          fn2: (window: BrowserWindow, arg1: number, arg2: number) => void
          name1: {
            fn1: (window: BrowserWindow, arg1: number, arg2: number) => void
            fn2: (window: BrowserWindow, arg1: string) => void
          }
        }
      }
      expectTypeOf<ExpectedType>().toEqualTypeOf<TestTarget>()
    })
  })

  describe('IpcBridgeApiGenerator', () => {
    it('invoke and on is existed', () => {
      const _apiHandlers = {
        invoke: {
          fn1: (e: IpcMainInvokeEvent) => console.log(e),
          fn2: (_e: IpcMainInvokeEvent) => `hello`,
          name1: {
            fn1: (_e: IpcMainInvokeEvent, arg1: number, arg2: number) => arg1 + arg2,
            fn2: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
          },
        },
        on: {
          fn1: (arg1: string) => arg1,
          fn2: (arg1: number, arg2: number) => arg1 + arg2,
          name2: {
            fn1: (arg1: boolean) => arg1,
            fn2: (arg1: number, arg2: number) => arg1 + arg2,
          },
        },
      }
      type TestTarget = IpcBridgeApiGenerator<typeof _apiHandlers>
      type ExpectedType = {
        invoke: {
          fn1: () => Promise<void>
          fn2: () => Promise<string>
          name1: {
            fn1: (arg1: number, arg2: number) => Promise<number>
            fn2: (arg1: string) => Promise<string>
          }
        }
        on: {
          fn1: (callback: (event: IpcRendererEvent, arg1: string) => void) => void
          fn2: (callback: (event: IpcRendererEvent, arg1: number) => void) => void
          name2: {
            fn1: (callback: (event: IpcRendererEvent, arg1: boolean) => void) => void
            fn2: (callback: (event: IpcRendererEvent, arg1: number) => void) => void
          }
        }
      }
      expectTypeOf<ExpectedType>().toEqualTypeOf<TestTarget>()
    })

    it('only invoke is existed', () => {
      const _apiHandlers = {
        invoke: {
          fn1: (e: IpcMainInvokeEvent) => console.log(e),
          fn2: (_e: IpcMainInvokeEvent) => `hello`,
          name1: {
            fn1: (_e: IpcMainInvokeEvent, arg1: number, arg2: number) => arg1 + arg2,
            fn2: (_e: IpcMainInvokeEvent, arg1: string) => arg1,
          },
        },
      }
      type TestTarget = IpcBridgeApiGenerator<typeof _apiHandlers>
      type ExpectedType = {
        invoke: {
          fn1: () => Promise<void>
          fn2: () => Promise<string>
          name1: {
            fn1: (arg1: number, arg2: number) => Promise<number>
            fn2: (arg1: string) => Promise<string>
          }
        }
      }
      expectTypeOf<ExpectedType>().toEqualTypeOf<TestTarget>()
    })

    it('only on is existed', () => {
      const _apiHandlers = {
        on: {
          fn1: (arg1: string) => arg1,
          fn2: (arg1: number, arg2: number) => arg1 + arg2,
          name2: {
            fn1: (arg1: boolean) => arg1,
            fn2: (arg1: number, arg2: number) => arg1 + arg2,
          },
        },
      }
      type TestTarget = IpcBridgeApiGenerator<typeof _apiHandlers>
      type ExpectedType = {
        on: {
          fn1: (callback: (event: IpcRendererEvent, arg1: string) => void) => void
          fn2: (callback: (event: IpcRendererEvent, arg1: number) => void) => void
          name2: {
            fn1: (callback: (event: IpcRendererEvent, arg1: boolean) => void) => void
            fn2: (callback: (event: IpcRendererEvent, arg1: number) => void) => void
          }
        }
      }
      expectTypeOf<ExpectedType>().toEqualTypeOf<TestTarget>()
    })
  })
})
