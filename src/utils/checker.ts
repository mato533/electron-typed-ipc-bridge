import type {
  IpcBridgeApiChannelMapGenerator as ChannelMap,
  IpcBridgeApiImplementation as IpcBridgeApi,
} from '../channel'

type Checker = <T extends IpcBridgeApi>(obj1: T, obj2: ChannelMap<T>) => boolean

const checkFalsy: Checker = (obj1, obj2) => {
  return !!obj1 && !!obj2
}

const checkEndpointType: Checker = (obj1, obj2) => {
  return typeof obj1 === 'function' && typeof obj2 === 'string'
}

const compareKeys: Checker = (obj1, obj2) => {
  // OK if ipcBridgeApi is function and channelMap is string(uuid)
  if (checkEndpointType(obj1, obj2)) return true

  return checkKeyCount(obj1, obj2) && compareKeyNameAndValue(obj1, obj2)
}

const checkKeyCount: Checker = (obj1, obj2) => {
  const keys1 = [...Object.keys(obj1)]
  const keys2 = [...Object.keys(obj2)]

  return keys1.length === keys2.length
}

const compareKeyNameAndValue: Checker = (obj1, obj2) => {
  const keys1 = [...Object.keys(obj1)]
  return keys1.every((key) => {
    // recursive call of 'haveSameStructure'
    return key in obj2 && haveSameStructure(obj1[key], obj2[key])
  })
}

const haveSameStructure: Checker = (obj1, obj2) => {
  if (!checkFalsy(obj1, obj2)) return false

  return compareKeys(obj1, obj2)
}

export { checkFalsy, haveSameStructure }
