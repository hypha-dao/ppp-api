import { AccessTokenRequest, RefreshAccessTokenRequest } from './';
import { GrantTypes } from '../const';
import { OauthError } from '../error'

class AccessTokenRequestFactory {
  static getInstance(grantType, appDao, oauthDao) {
    switch (grantType) {
      case GrantTypes.AUTHORIZATION_CODE:
        return new AccessTokenRequest(appDao, oauthDao);
      case GrantTypes.REFRESH_TOKEN:
        return new RefreshAccessTokenRequest(appDao, oauthDao);
      default:
        throw new OauthError(OauthError.types.UNSUPPORTED_GRANT_TYPE, `Invalid grant type: ${grantType}`);
    }
  }
}

export default AccessTokenRequestFactory;