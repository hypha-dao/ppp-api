import OauthRequest from './OauthRequest';
import { OauthError } from '../error';

const DEFAULT_SCOPE = 'profile_read';

class AuthCodeRequest extends OauthRequest {

  constructor(appDao, oauthDoa, validScopes) {
    super(appDao, oauthDoa);
    this.validScopes = validScopes;
  }

  processRequest({
    response_type,
    client_id,
    redirect_uri,
    scope,
  },
    eosAccount) {

    scope = scope || DEFAULT_SCOPE;
    const scopes = scope.split();
    this._validateInputs({
      response_type,
      client_id,
      redirect_uri,
      scopes,
    });

    this._loadApp();

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


  }

  _validateInputs({
    response_type,
    client_id,
    scopes,
  }) {
    if (response_type !== 'code') {
      throw new OauthRequest(OauthRequest.types.INVALID_REQUEST, `Invalid response type: ${response_type}`);
    }
    if (!client_id) {
      throw new OauthRequest(OauthRequest.types.INVALID_REQUEST, 'Client id is a required parameter');
    }
    const invalidScope = this._findInvalidScope(scopes);
    if (invalidScope) {
      throw new OauthRequest(OauthRequest.types.INVALID_SCOPE, `Unknown requested scope: ${invalidScope}`);
    }
  }

  _findInvalidScope(scopes) {
    for (const scope of scopes) {
      if (this.validScopes.indexOf(scope) == -1) {
        return scope;
      }
    }
    return null;
  }

  _isRegisteredUrl(url) {
    return this._hasRegisteredUrls() && this._redirectUrls().indexOf(url);
  }

}

export default OauthRequest;