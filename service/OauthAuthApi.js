import BaseAuthApi from './BaseAuthApi';

class OauthAuthApi extends BaseAuthApi {

    static isThisAuth(event) {
        return !!event.requestContext.authorizer;
    }
    constructor(event, body){
        super(event, body);
        this.authorizer = event.requestContext.authorizer;
    }

    async getApp(mustExist = true) {
        const {
            appId
        } = this.authorizer;
        return this._getAppById(appId, mustExist);
    }

    async getUserName() {
        return this.authorizer.eosAccount;
    }

    hasScope(scope){
        const {
            scopes
        } = this.authorizer;
        return scopes && scopes.indexOf(scope) > -1;
    }
}

export default OauthAuthApi;

