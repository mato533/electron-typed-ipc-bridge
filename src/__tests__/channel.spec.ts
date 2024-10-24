import { getApiChannelMap, haveSameStructure } from '../channel'
import * as uuid from '../utils/uuid'

import type { IpcMainInvokeEvent } from 'electron'

describe('Generate api channel map', () => {
  const dummyUUID = '1234-abcd-1234-abcd-1234'
  const uuidSpy = vi.spyOn(uuid, 'genUUID').mockReturnValue(dummyUUID)

  it('generate vaild structure', () => {
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
      },
    } as const
    const result = getApiChannelMap(apiHandlers)
    assert.deepEqual(result, {
      invoke: {
        fn1: dummyUUID,
        fn2: dummyUUID,
        name1: {
          fn1: dummyUUID,
          fn2: dummyUUID,
        },
      },
      on: {
        fn1: dummyUUID,
      },
    })
  })

  it('same channelmap are retured when multiple called', () => {
    uuidSpy.mockRestore()
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
    const result1 = getApiChannelMap(apiHandlers)
    const result2 = getApiChannelMap(apiHandlers)
    assert.deepEqual(result1, result2)
  })
})

describe('haveSameStructure', () => {
  it('success', () => {
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

  it('fail', () => {
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

    const channelMap = {
      invoke: {
        fn1: 'uuid-fn1',
        fn2: 'uuid-fn2',
        name1: {
          fn1: 'uuid-name1-fn1',
          // fn2: 'uuid-name1-fn2', // unmatch
          fn3: 'uuid-name1-fn3', // unmatch
        },
      },
      on: {
        fn1: 'uuid-fn1',
        name2: {
          fn1: 'uuid-name2-fn1',
          // fn2: 'uuid-name2-fn2', // unmatch
        },
      },
    }
    // @ts-ignore
    expect(haveSameStructure(apiHandlers, channelMap)).toBeFalsy()
  })
})
