import { checkFalsy, haveSameStructure } from '../utils/checker'

import type { IpcMainInvokeEvent } from 'electron'

describe('checkFalsy', () => {
  const api = {
    on: { api: () => 1 },
    invoke: { api: () => 1 },
  }
  const channelMap = {
    on: { api: 'uuid' },
    invoke: { api: 'uuid' },
  }

  it('ok', () => {
    expect(checkFalsy(api, channelMap)).toBeTruthy()
  })
  it('undefined - channelMap', () => {
    expect(checkFalsy(api, undefined)).toBeFalsy()
  })
  it('undefined - ipcBridge', () => {
    expect(checkFalsy(undefined, channelMap)).toBeFalsy()
  })
})

const apiHandlers = {
  invoke: {
    fn1: (e: IpcMainInvokeEvent) => console.log(e),
    fn2: (e: IpcMainInvokeEvent) => console.log(e),
    name1: {
      fn1: () => console.log(),
      fn2: (e: IpcMainInvokeEvent) => console.log(e),
    },
  },
  on: {
    fn1: () => console.log('sss'),
    name2: {
      fn1: () => console.log(),
      fn2: (e: IpcMainInvokeEvent) => console.log(e),
    },
  },
} as const

const apiHandlersOnlyInvoke = {
  invoke: {
    fn1: (e: IpcMainInvokeEvent) => console.log(e),
    fn2: (e: IpcMainInvokeEvent) => console.log(e),
    name1: {
      fn1: () => console.log(),
      fn2: (e: IpcMainInvokeEvent) => console.log(e),
    },
  },
} as const

const apiHandlersOnlyOn = {
  on: {
    fn1: () => console.log('sss'),
    name2: {
      fn1: () => console.log(),
      fn2: (e: IpcMainInvokeEvent) => console.log(e),
    },
  },
} as const
describe('haveSameStructure', () => {
  describe('success', () => {
    it('on and invoke', () => {
      const channelMap = {
        invoke: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name1: {
            fn1: 'uuid-name1-fn1',
            fn2: 'uuid-name1-fn2',
          },
        },
        on: {
          fn1: 'uuid-fn1',
          name2: {
            fn1: 'uuid-name2-fn1',
            fn2: 'uuid-name2-fn2',
          },
        },
      }
      expect(haveSameStructure(apiHandlers, channelMap)).toBeTruthy()
    })

    it('only invoke', () => {
      const channelMap = {
        on: {
          fn1: 'uuid-fn1',
          name2: {
            fn1: 'uuid-name2-fn1',
            fn2: 'uuid-name2-fn2',
          },
        },
      }
      expect(haveSameStructure(apiHandlersOnlyOn, channelMap)).toBeTruthy()
    })

    it('only on', () => {
      const channelMap = {
        invoke: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name1: {
            fn1: 'uuid-name1-fn1',
            fn2: 'uuid-name1-fn2',
          },
        },
      }
      expect(haveSameStructure(apiHandlersOnlyInvoke, channelMap)).toBeTruthy()
    })
  })
  describe('fail', () => {
    it('function missing', () => {
      const channelMap = {
        invoke: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name1: {
            fn1: 'uuid-name1-fn1',
            // fn2: 'uuid-name1-fn2', // nomatch
          },
        },
        on: {
          fn1: 'uuid-fn1',
          name2: '12',
        },
      }
      // @ts-expect-error
      expect(haveSameStructure(apiHandlers, channelMap)).toBeFalsy()
    })

    it('object missing', () => {
      const channelMap = {
        invoke: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          // name1: {
          //   fn1: 'uuid-name1-fn1',
          //   fn2: 'uuid-name1-fn2', // nomatch
          // },
        },
        on: {
          fn1: 'uuid-fn1',
          name2: '12',
        },
      }
      // @ts-expect-error
      expect(haveSameStructure(apiHandlers, channelMap)).toBeFalsy()
    })

    it('mismatch function name', () => {
      const channelMap = {
        invoke: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name1: {
            fn1: 'uuid-name1-fn1',
            fn99: 'uuid-name1-fn2', // nomatch
          },
        },
        on: {
          fn1: 'uuid-fn1',
          name2: '12',
        },
      }
      // @ts-expect-error
      expect(haveSameStructure(apiHandlers, channelMap)).toBeFalsy()
    })

    it('mismatch object name', () => {
      const channelMap = {
        invoke: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name99: {
            fn1: 'uuid-name1-fn1',
            fn2: 'uuid-name1-fn2', // nomatch
          },
        },
        on: {
          fn1: 'uuid-fn1',
          name2: '12',
        },
      }
      // @ts-expect-error
      expect(haveSameStructure(apiHandlers, channelMap)).toBeFalsy()
    })

    it('only Invoke', () => {
      const channelMap = {
        on: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name1: 'uuid-name1-fn3', // nomatch
        },
      }
      // @ts-expect-error
      expect(haveSameStructure(apiHandlersOnlyInvoke, channelMap)).toBeFalsy()
    })

    it('only On', () => {
      const channelMap = {
        on: {
          fn1: 'uuid-fn1',
          fn2: 'uuid-fn2',
          name1: 'uuid-name1-fn3', // nomatch
        },
      }
      // @ts-expect-error
      expect(haveSameStructure(apiHandlersOnlyOn, channelMap)).toBeFalsy()
    })
  })
})
