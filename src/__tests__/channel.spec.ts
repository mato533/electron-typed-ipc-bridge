import { getApiChannelMap } from '../channel'
import * as uuid from '../utils/uuid'

import type { IpcMainInvokeEvent } from 'electron'

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
describe('Generate api channel map', () => {
  const dummyUUID = '1234-abcd-1234-abcd-1234'
  const uuidSpy = vi.spyOn(uuid, 'genUUID').mockReturnValue(dummyUUID)

  it('generate vaild structure', () => {
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
        name2: {
          fn1: dummyUUID,
          fn2: dummyUUID,
        },
      },
    })
  })

  it('same channelmap are retured when multiple called', () => {
    uuidSpy.mockRestore()
    const result1 = getApiChannelMap(apiHandlers)
    const result2 = getApiChannelMap(apiHandlers)
    assert.deepEqual(result1, result2)
  })
})
