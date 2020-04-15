import BaseCognitoAuthApi from './BaseCognitoAuthApi';

class UnauthCognitoAuthApi extends BaseCognitoAuthApi {

    static isThisAuth() {
        return true
    }

    async getUserName() {
        throw "A username can't be obtained for unauthenticated users";
    }

}

export default UnauthCognitoAuthApi;

