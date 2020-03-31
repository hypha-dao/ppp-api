import OauthRequest from './OauthRequest';
import { OauthError } from '../error';
import { Util } from '../util';

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
    const resourceScopes = this._getScopesByResource(resource);
    this._validateOauth(resourceScopes);

    const {
      eosAccount,
      appId,
    } = this.oauth;

    await this._loadApp(appId);
    this._assertOuathAppStatus(this.app.oauthAppStatus, OauthError.types.INVALID_TOKEN);

    return {
      eosAccount,
      appId,
      scopes: this.oauth.scopes,
    };
  }

  async updateLastAccessAt() {
    this.oauth.lastAccessAt = Date.now();
    await this.oauthDao.save(this.oauth);
  }

  async _loadOauth(accessToken) {
    this.oauth = await this.oauthDao.getByAccessToken(accessToken);
  }

  _getScopesByResource(resource) {
    const scopes = this.scopes[resource];
    if (!scopes) {
      throw new OauthError(OauthError.types.INSUFFICIENT_SCOPE, 'Resource is out of bounds');
    }
    return scopes;
  }

  _validateOauth(resourceScopes) {
    const {
      accessTokenExpiration,
      oauthTokenStatus,
      scopes,
    } = this.oauth;

    this._assertOuathTokenStatus(oauthTokenStatus, OauthError.types.INVALID_TOKEN);

    if (this.hasExpired(accessTokenExpiration)) {
      throw new OauthError(OauthError.types.INVALID_TOKEN, 'Authorization code has expired');
    }
    
    if (!scopes || !Util.includesOne(scopes, resourceScopes)) {
      throw new OauthError(OauthError.types.INSUFFICIENT_SCOPE, `Required scope is: ${requiredScope}`);
    }
  }

}

export default ApiAccessRequest;