import { CognitoAuthApi, OauthAuthApi } from '.';

class AuthApiFactory {
  static getInstance(event) {
    if (this.isCognitoAuth(event)) {
      if (!this.cognitoAuthApi) {
        this.cognitoAuthApi = new CognitoAuthApi();
      }
      return this.cognitoAuthApi;
    } else {
      if (!this.oauthAuthApi) {
        this.oauthAuthApi = new OauthAuthApi();
      }
      return this.oauthAuthApi;
    }
  }

  static isCognitoAuth(event) {
    return !!event.requestContext.identity.cognitoAuthenticationProvider;
  }
}

export default AuthApiFactory;