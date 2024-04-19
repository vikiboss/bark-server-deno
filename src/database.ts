import { Utils } from './util.ts'
import { kv, KVStore } from './kv-store.ts'

export class Database {
  static configPrefix: string[] = ['config']
  static devicePrefix: string[] = ['devices']

  static config = {
    arrowAddNewDevice: KVStore.createAtom([...this.configPrefix, 'arrowAddNewDevice'], false),
    allowQueryDevice: KVStore.createAtom([...this.configPrefix, 'allowQueryDevice'], false),
    authTokenValue: KVStore.createAtom([...this.configPrefix, 'authToken', 'value'], ''),
    authTokenExpireTimestamp: KVStore.createAtom(
      [...this.configPrefix, 'authToken', 'expireTimestamp'],
      Utils.timestamp() + 30 * 24 * 60 * 60
    ),
  }

  static async getDeviceCount() {
    return (await kv.getMany([this.devicePrefix])).length
  }

  static async getDeviceTokenByKey(key: string) {
    const dKey = (key || '').replace(/[^a-zA-Z0-9]/g, '') || '_PLACE_HOLDER_'
    return (await kv.get([...this.devicePrefix, dKey])).value
  }

  static async setDeviceTokenByKey(key: string, token: string) {
    const deviceToken = await kv.set([...this.devicePrefix, key], token)
    return await deviceToken
  }

  static async saveAuthorizationToken(token: string) {
    return await this.config.authTokenValue.set(token)
  }

  static async authorizationToken() {
    return (await this.config.authTokenExpireTimestamp.get()) > Utils.timestamp()
  }
}
