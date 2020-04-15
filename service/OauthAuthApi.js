import BaseAuthApi from './BaseAuthApi';

class OauthAuthApi extends BaseAuthApi {

    static isThisAuth(event) {
        return !!event.requestContext.authorizer;
    }

    init(event, body){
        super.init(event, body)
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
        return scopes && scopes.includes(scope);
    }
}

export default OauthAuthApi;

