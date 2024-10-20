import type { BrowserWindow, IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { RemoveEventArg, IpcBridgeApiTypeGenerator, IpcBridgeApiInvoker } from '../preload'
import type { ApiChannelMapGenerator } from '../channel'
import type { IpcBridgeApiEmitterTypeGenerator } from '../main'

describe('Type check', () => {
  it('RemoveEventArg', () => {
    const _fn = (e: IpcMainInvokeEvent, arg1: string) => arg1
    type ExpectedApiType = (arg1: string) => string

    expectTypeOf<ExpectedApiType>().toEqualTypeOf<RemoveEventArg<typeof _fn>>()
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
      fn1: () => void
      fn2: () => string
      name1: {
        fn1: (arg1: string) => string
        fn2: () => void
      }
    }

    expectTypeOf<ExpectedType>().toEqualTypeOf<IpcBridgeApi>()
  })

  it('ApiChannelMapGenerator', () => {
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

    type TestTarget = ApiChannelMapGenerator<typeof _apiHandlers>
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

      type TestTarget = IpcBridgeApiEmitterTypeGenerator<typeof _apiHandlers>
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

      type TestTarget = IpcBridgeApiEmitterTypeGenerator<typeof _apiHandlers>

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

      type TestTarget = IpcBridgeApiEmitterTypeGenerator<typeof _apiHandlers>
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

  describe('IpcBridgeApiTypeGenerator', () => {
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
      type TestTarget = IpcBridgeApiTypeGenerator<typeof _apiHandlers>
      type ExpectedType = {
        invoke: {
          fn1: () => void
          fn2: () => string
          name1: {
            fn1: (arg1: number, arg2: number) => number
            fn2: (arg1: string) => string
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
      type TestTarget = IpcBridgeApiTypeGenerator<typeof _apiHandlers>
      type ExpectedType = {
        invoke: {
          fn1: () => void
          fn2: () => string
          name1: {
            fn1: (arg1: number, arg2: number) => number
            fn2: (arg1: string) => string
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
      type TestTarget = IpcBridgeApiTypeGenerator<typeof _apiHandlers>
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
