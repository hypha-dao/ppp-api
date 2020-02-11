import BaseCognitoAuthApi from './BaseCognitoAuthApi';

class UnauthCognitoAuthApi extends BaseCognitoAuthApi {

    static isThisAuth(event) {
        throw "This should be used when no other authentication is found";
    }

    async getUserName(event) {
        throw "A username can't be obtained for unauthenticated users";
    }

}

export default UnauthCognitoAuthApi;

