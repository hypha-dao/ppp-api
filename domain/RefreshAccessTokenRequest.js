import BaseAccessTokenRequest from './BaseAccessTokenRequest';
import { GrantTypes } from '../const';
import { OauthError } from '../error';

class RefreshAccessTokenRequest extends BaseAccessTokenRequest {

  async processRequest({
    grant_type,
    refresh_token,
    client_id,
    client_secret,
  }) {
    await this._validateInputs({
      grant_type,
      refresh_token,
      client_id,
    });

    await this._loadApp(client_id);
    this._validateApp(client_secret);

    await this._loadOauth(refresh_token);
    this._validateOauth(client_id);

    const updatedOauth = {
      ...this.oauth,
      ...this._generateAccessToken(),
    };
    await this.oauthDao.save(updatedOauth);

    return this._generateAccessTokenResponse(updatedOauth);
  }

  _validateInputs({
    grant_type,
    refresh_token,
    client_id,
  }) {
    if (grant_type !== GrantTypes.REFRESH_TOKEN) {
      throw new OauthError(OauthError.types.UNSUPPORTED_GRANT_TYPE, `Invalid grant type: ${grant_type}`);
    }
    if (!refresh_token) {
      throw new OauthError(OauthError.types.INVALID_REQUEST, 'Refresh Token is a required parameter');
    }
    if (!client_id) {
      throw new OauthError(OauthError.types.INVALID_REQUEST, 'Client id is a required parameter');
    }
  }


  async _loadOauth(refreshToken) {
    this.oauth = await this.oauthDao.getByRefreshToken(refreshToken);
  }

  _validateOauth(client_id) {
    const {
      refreshTokenExpiration,
      oauthTokenStatus,
    } = this.oauth;

    this._assertOuathTokenStatus(oauthTokenStatus, OauthError.types.INVALID_GRANT);

    if (this.hasExpired(refreshTokenExpiration)) {
      throw new OauthError(OauthError.types.INVALID_GRANT, 'Refresh token has expired');
    }

    this._assertOuathBelongsToClient(client_id);
  }

}

export default RefreshAccessTokenRequest;