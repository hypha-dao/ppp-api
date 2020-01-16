import OauthRequest from './OauthRequest';
import { OauthError } from '../error';
import { Util } from '../util';

class BaseAccessTokenRequest extends OauthRequest {

  _validateApp(client_secret) {
    if (this.app.isPrivate) {
      if (!client_secret) {
        throw new OauthError(OauthError.types.INVALID_CLIENT, 'No secret was provided');
      }
      if (this.app.secret !== client_secret) {
        throw new OauthError(OauthError.types.INVALID_CLIENT, 'Invalid secret');
      }
    }
  }

  _assertOuathBelongsToClient(client_id) {
    if (client_id !== this.oauth.appId) {
      throw new OauthError(OauthError.types.INVALID_GRANT, 'Grant not found');
    }
  }

  _generateAccessToken() {
    return {
      accessToken: Util.uuid(),
      accessTokenExpiration: this.getExpirationTime(process.env.accessTokenMinutesTTL),
    };
  }

  _generateRefreshToken() {
    return {
      refreshToken: Util.uuid(),
      refreshTokenExpiration: this.getExpirationTime(process.env.refreshTokenMinutesTTL),
    };
  }

  _generateAccessTokenResponse(oauth) {
    return {
      access_token: oauth.accessToken,
      refresh_token: oauth.refreshToken,
      token_type: 'bearer',
      expires_in: process.env.accessTokenMinutesTTL,
    };

  }

}

export default BaseAccessTokenRequest;