import BaseAccessTokenRequest from './BaseAccessTokenRequest';
import { GrantTypes } from '../const';
import { OauthError } from '../error';


class AccessTokenRequest extends BaseAccessTokenRequest {

  async processRequest({
    grant_type,
    code,
    client_id,
    client_secret,
    redirect_uri,
  }) {
    await this._validateInputs({
      grant_type,
      code,
      client_id,
    });

    await this._loadApp(client_id);
    this._validateApp(client_secret);

    await this._loadOauth(code);
    this._validateOauth(client_id, redirect_uri);

    const updatedOauth = {
      ...this.oauth,
      ...this._generateAccessToken(),
      ...this._generateRefreshToken(),
    };
    await this.oauthDao.save(updatedOauth);

    return this._generateAccessTokenResponse(updatedOauth);
  }

  _validateInputs({
    grant_type,
    code,
    client_id,
  }) {
    if (grant_type !== GrantTypes.AUTHORIZATION_CODE) {
      throw new OauthError(OauthError.types.UNSUPPORTED_GRANT_TYPE, `Invalid grant type: ${grant_type}`);
    }
    if (!code) {
      throw new OauthError(OauthError.types.INVALID_REQUEST, 'Code is a required parameter');
    }
    if (!client_id) {
      throw new OauthError(OauthError.types.INVALID_REQUEST, 'Client id is a required parameter');
    }
  }

  async _loadOauth(code) {
    this.oauth = await this.oauthDao.getByAuthCode(code);
  }

  _validateOauth(client_id, redirect_uri) {
    const {
      redirectUri,
      hasRedirectUriParam,
      authorizationCodeExpiration,
      accessToken,
    } = this.oauth;

    if (accessToken) {
      throw new OauthError(OauthError.types.INVALID_GRANT, 'Authorization code has been used before');
    }

    if (this.hasExpired(authorizationCodeExpiration)) {
      throw new OauthError(OauthError.types.INVALID_GRANT, 'Authorization code has expired');
    }

    this._assertOuathBelongsToClient(client_id);

    if (hasRedirectUriParam) {
      if (redirectUri != redirect_uri) {
        throw new OauthError(OauthError.types.INVALID_GRANT, 'Redirect URLs do not match');
      }
    } else if (redirect_uri) {
      throw new OauthError(OauthError.types.INVALID_GRANT, 'A Redirect URL was not sent on the auth code request, but sent on this one');
    }
  }

}

export default AccessTokenRequest;