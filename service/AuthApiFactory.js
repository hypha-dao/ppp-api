import {
  CognitoAuthApi,
  OauthAuthApi,
  PrivateAuthApi,
  UnauthCognitoAuthApi
} from '.';

class AuthApiFactory {
  static _init(){
    if(!this.auths) {
      this.auths = [
        {
          authClass: CognitoAuthApi
        },
        {
          authClass: OauthAuthApi
        },
        {
          authClass: PrivateAuthApi
        },
        {
          authClass: UnauthCognitoAuthApi //this must always be last
        },
      ];
    }
  }

  static getInstance(event, body) {
    this._init()
    for (const auth of this.auths) {
      let {
        authClass,
        authInstance
      } = auth;

      if (authClass.isThisAuth(event)) {
        if (!authInstance) {
          authInstance = new authClass();
          auth.authInstance = authInstance;
        }
        authInstance.init(event, body);
        return authInstance;
      }
    }
  }
}
export default AuthApiFactory;