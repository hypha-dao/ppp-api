import { OauthTokenStatus } from '@smontero/ppp-common';
import OauthRequest from './OauthRequest';
import { App } from '../domain';
import { OauthError } from '../error';
import { Util } from '../util';

const DEFAULT_SCOPE = 'profile_read';

class AuthCodeRequest extends OauthRequest {

  constructor(appDao, oauthDao, scopes) {
    super(appDao, oauthDao);
    this.scopes = scopes;
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
      app: App.restrictAccess(this.app),
      scopes: this.requestedScopes,
    };
  }

  async processCodeRequest({
    response_type,
    client_id,
    redirect_uri,
    scope,
  }, profile) {
    await this._validateRequest({
      response_type,
      client_id,
      redirect_uri,
      scope,
    });

    if (await this.scopes.requiresVerifiedProfile(this.scopeKeys) && !profile.isVerified()) {
      throw new OauthError(OauthError.types.INVALID_SCOPE, `Requested scopes require a verified profile but the user does not have one`);
    }

    const oauth = {
      appId: client_id,
      eosAccount: profile.eosAccount,
      scopes: this.scopeKeys,
      redirectUri: this.redirectUri,
      hasRedirectUriParam: !!redirect_uri,
      authorizationCodeExpiration: this.getExpirationTime(Number(process.env.authCodeMinutesTTL)),
      authorizationCode: Util.uuid(),
      createdAt: Date.now(),
      oauthTokenStatus: OauthTokenStatus.VALID,
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

    this.scopeKeys = scope.split(' ');
    this.requestedScopes = await this.scopes.find(this.scopeKeys);
    await this._loadApp(client_id);

    this._assertOuathAppStatus(this.app.oauthAppStatus, OauthError.types.INVALID_CLIENT);

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

  _isRegisteredUrl(url) {
    return this._hasRegisteredUrls() && this._redirectUrls().indexOf(url) > -1;
  }

}

export default AuthCodeRequest;