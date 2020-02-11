import { CognitoAuthApi, OauthAuthApi, PrivateAuthApi, UnauthCognitoAuthApi } from '.';

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
      if (!this.unauthCognitoAuthApi) {
        this.unauthCognitoAuthApi = new UnauthCognitoAuthApi();
      }
      return this.unauthCognitoAuthApi;
    }
  }
}

export default AuthApiFactory;