import BaseCognitoAuthApi from './BaseCognitoAuthApi';

class UnauthCognitoAuthApi extends BaseCognitoAuthApi {

    static isThisAuth() {
        throw "This should be used when no other authentication is found";
    }

    async getUserName() {
        throw "A username can't be obtained for unauthenticated users";
    }

}

export default UnauthCognitoAuthApi;

