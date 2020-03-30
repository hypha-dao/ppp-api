import { CognitoAuthApi, OauthAuthApi, PrivateAuthApi, UnauthCognitoAuthApi } from '.';

class AuthApiFactory {
  static getInstance(event, body) {
    if (CognitoAuthApi.isThisAuth(event)) {
      if (!this.cognitoAuthApi) {
        this.cognitoAuthApi = new CognitoAuthApi(event, body);
      }
      return this.cognitoAuthApi;
    } else if (OauthAuthApi.isThisAuth(event)) {
      if (!this.oauthAuthApi) {
        this.oauthAuthApi = new OauthAuthApi(event, body);
      }
      return this.oauthAuthApi;
    } else if (PrivateAuthApi.isThisAuth(event)) {
      if (!this.privateAuthApi) {
        this.privateAuthApi = new PrivateAuthApi(event, body);
      }
      return this.privateAuthApi;
    } else {
      if (!this.unauthCognitoAuthApi) {
        this.unauthCognitoAuthApi = new UnauthCognitoAuthApi(event, body);
      }
      return this.unauthCognitoAuthApi;
    }
  }
}

export default AuthApiFactory;