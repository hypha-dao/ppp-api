import { OauthError } from '../error';

class Scopes {

  constructor(scopeDao) {
    this.scopeDao = scopeDao;
    this.scopes = null;
  }

  async getScopes() {
    if (!this.scopes) {
      this.scopes = await this.scopeDao.getAllMappedByScope();
    }
    return this.scopes;
  }

  async find(scopeKeys) {
    const validScopes = await this.getScopes();
    const scopes = [];
    for (const scopeKey of scopeKeys) {
      const scope = validScopes[scopeKey];
      if (!scope) {
        throw new OauthError(OauthError.types.INVALID_SCOPE, `Unknown requested scope: ${scopeKey}`);
      }
      scopes.push(scope);
    }
    return scopes;
  }

  async requiresVerifiedProfile(scopeKeys) {
    const validScopes = await this.getScopes();
    for (const scopeKey of scopeKeys) {
      if (validScopes[scopeKey].requiresVerifiedProfile) {
        return true;
      }
    }
    return false;
  }

}

export default Scopes;