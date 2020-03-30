import { AccessTokenRequest, RefreshAccessTokenRequest } from './';
import { GrantTypes } from '../const';
import { OauthError } from '../error'

class AccessTokenRequestFactory {
  static getInstance(grantType, params) {
    switch (grantType) {
      case GrantTypes.AUTHORIZATION_CODE:
        return new AccessTokenRequest(params);
      case GrantTypes.REFRESH_TOKEN:
        return new RefreshAccessTokenRequest(params);
      default:
        throw new OauthError(OauthError.types.UNSUPPORTED_GRANT_TYPE, `Invalid grant type: ${grantType}`);
    }
  }
}

export default AccessTokenRequestFactory;