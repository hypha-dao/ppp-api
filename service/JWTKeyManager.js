import { JWK } from 'jose';
import SystemsManager from './SystemsManager'

class JWTKeyManager {

  constructor() {
    this.sm = new SystemsManager();
    this.keys = {};
  }

  async getKey(name) {
    let key = this.keys[name];
    if(!key){
      const pemKey = await this.sm.getParameter(name);
      key = JWK.asKey(pemKey, { alg: 'RS256', use: 'sig' });
      this.keys[name] = key;
    }
    return key;
  }

}

export default JWTKeyManager;