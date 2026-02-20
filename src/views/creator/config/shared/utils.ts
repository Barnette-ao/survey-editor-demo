import { v4 as uuidv4 } from 'uuid'
import { toRaw } from 'vue'

export const generateUUID = () => {
	return uuidv4()
}

/**
 * 递归地将 Proxy 对象转换为原始对象
 */
const deepToRaw = <T>(obj: T): T => {
  const raw = toRaw(obj)
  
  if (Array.isArray(raw)) {
    return raw.map(item => deepToRaw(item)) as T
  }
  
  if (raw !== null && typeof raw === 'object') {
    const result: any = {}
    for (const key in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        result[key] = deepToRaw((raw as any)[key])
      }
    }
    return result as T
  }
  
  return raw
}

export function snapshot<T>(value: T): T {
  return structuredClone(deepToRaw(value))
}

