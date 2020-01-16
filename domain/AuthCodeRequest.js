import OauthRequest from './OauthRequest';
import { OauthError } from '../error';
import { Util } from '../util';

const DEFAULT_SCOPE = 'profile_read';

class AuthCodeRequest extends OauthRequest {

  constructor(appDao, oauthDao, validScopes) {
    super(appDao, oauthDao);
    this.validScopes = validScopes;
  }

  async processInitialRequest({
    response_type,
    client_id,
    redirect_uri,
    scope,
  }) {
    await this._validateRequest({
      response_type,
      client_id,
      redirect_uri,
      scope,
    });
    return {
      app: this.app,
      scopes: this.scopes,
    };
  }

  async processCodeRequest({
    response_type,
    client_id,
    redirect_uri,
    scope,
  }, eosAccount) {
    await this._validateRequest({
      response_type,
      client_id,
      redirect_uri,
      scope,
    });

    const oauth = {
      appId: client_id,
      eosAccount: eosAccount,
      scopes: this.scopeKeys,
      redirectUri: this.redirectUri,
      hasRedirectUriParam: !!redirect_uri,
      authorizationCodeExpiration: this.getExpirationTime(process.env.authCodeMinutesTTL),
      authorizationCode: Util.uuid(),
    };
    await this.oauthDao.save(oauth);
    return oauth;
  }

  async _validateRequest({
    response_type,
    client_id,
    redirect_uri,
    scope,
  }) {

    scope = scope || DEFAULT_SCOPE;

    this._validateInputs({
      response_type,
      client_id,
    });

    this.scopeKeys = scope.split();
    this.scopes = this._findScopes(this.scopeKeys);
    await this._loadApp(client_id);

    if (redirect_uri) {
      if (!this._isRegisteredUrl(redirect_uri)) {
        throw new OauthError(OauthError.types.INVALID_REQUEST, 'Redirect url is not registered');
      }
    } else {
      if (!this._hasRegisteredUrls()) {
        throw new OauthError(OauthError.types.INVALID_CLIENT, 'Client app has no registered urls');
      }
      redirect_uri = this._redirectUrls()[0];
    }
    this.redirectUri = redirect_uri;
  }

  _validateInputs({
    response_type,
    client_id,
  }) {
    if (response_type !== 'code') {
      throw new OauthError(OauthError.types.INVALID_REQUEST, `Invalid response type: ${response_type}`);
    }
    if (!client_id) {
      throw new OauthError(OauthError.types.INVALID_REQUEST, 'Client id is a required parameter');
    }
  }

  _findScopes(scopeKeys) {
    const scopes = [];
    for (const scopeKey of scopeKeys) {
      const scope = this.validScopes[scopeKey];
      if (!scope) {
        throw new OauthError(OauthError.types.INVALID_SCOPE, `Unknown requested scope: ${scopeKey}`);
      }
      scopes.push(scope);
    }
    return scopes;
  }

  _isRegisteredUrl(url) {
    return this._hasRegisteredUrls() && this._redirectUrls().indexOf(url) > -1;
  }

}

export default AuthCodeRequest;