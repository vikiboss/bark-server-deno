export const kv = await Deno.openKv()

export class KVStore {
  static createAtom<T>(key: string[], defaultValue?: T) {
    return {
      set: async (value: T) => {
        return (await kv.set(key, value)).ok
      },
      get: async (): Promise<T> => {
        return ((await kv.get(key)).value ?? defaultValue) as T
      },
    }
  }
}
