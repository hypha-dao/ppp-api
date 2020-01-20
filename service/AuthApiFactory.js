import { CognitoAuthApi, OauthAuthApi, PrivateAuthApi } from '.';

class AuthApiFactory {
  static getInstance(event) {
    if (CognitoAuthApi.isThisAuth(event)) {
      if (!this.cognitoAuthApi) {
        this.cognitoAuthApi = new CognitoAuthApi();
      }
      return this.cognitoAuthApi;
    } else if (OauthAuthApi.isThisAuth(event)) {
      if (!this.oauthAuthApi) {
        this.oauthAuthApi = new OauthAuthApi();
      }
      return this.oauthAuthApi;
    } else if (PrivateAuthApi.isThisAuth(event)) {
      if (!this.privateAuthApi) {
        this.privateAuthApi = new PrivateAuthApi();
      }
      return this.privateAuthApi;
    } else {
      throw 'There is no AuthApi class to handle this type of authentication';
    }
  }
}

export default AuthApiFactory;