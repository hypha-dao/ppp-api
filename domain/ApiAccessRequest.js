import OauthRequest from './OauthRequest';
import { OauthError } from '../error';

class ApiAccessRequest extends OauthRequest {

  constructor(appDao, oauthDao, scopes) {
    super(appDao, oauthDao);
    this.scopes = scopes;
  }

  async verifyAccess({
    accessToken,
    resource,
    payload
  }) {
    await this._loadOauth(accessToken);
    const requiredScope = this._getScopeByResource(resource);
    this._validateOauth(requiredScope);

    const {
      eosAccount,
      appId,
    } = this.oauth;

    await this._loadApp(appId);
    this._assertOuathAppStatus(this.app.oauthAppStatus, OauthError.types.INVALID_TOKEN);

    return {
      eosAccount,
      appId,
    };
  }

  async updateLastAccessAt() {
    this.oauth.lastAccessAt = Date.now();
    await this.oauthDao.save(this.oauth);
  }

  async _loadOauth(accessToken) {
    this.oauth = await this.oauthDao.getByAccessToken(accessToken);
  }

  _getScopeByResource(resource) {
    const scope = this.scopes[resource];
    if (!scope) {
      throw new OauthError(OauthError.types.INSUFFICIENT_SCOPE, 'Resource is out of bounds');
    }
    return scope.scope;
  }

  _validateOauth(requiredScope) {
    const {
      accessTokenExpiration,
      oauthTokenStatus,
      scopes,
    } = this.oauth;

    this._assertOuathTokenStatus(oauthTokenStatus, OauthError.types.INVALID_TOKEN);

    if (this.hasExpired(accessTokenExpiration)) {
      throw new OauthError(OauthError.types.INVALID_TOKEN, 'Authorization code has expired');
    }
    if (!scopes || scopes.indexOf(requiredScope) < 0) {
      throw new OauthError(OauthError.types.INSUFFICIENT_SCOPE, `Required scope is: ${requiredScope}`);
    }
  }

}

export default ApiAccessRequest;