import { getApiChannelMap } from '../channel'

import type { IpcMainInvokeEvent } from 'electron'

describe('Generate api channel map', () => {
  vi.mock('crypto', () => {
    return {
      randomUUID: vi.fn().mockReturnValue('uuid'),
    }
  })

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
      },
    } as const
    const result = getApiChannelMap(apiHandlers)
    assert.deepEqual(result, {
      invoke: {
        fn1: 'uuid',
        fn2: 'uuid',
        name1: {
          fn1: 'uuid',
          fn2: 'uuid',
        },
      },
      on: {
        fn1: 'uuid',
      },
    })
  })
})
