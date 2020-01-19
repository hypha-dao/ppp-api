import BaseAuthApi from './BaseAuthApi';

class OauthAuthApi extends BaseAuthApi {

    async getApp(event, body, mustExist = true) {
        const {
            appId
        } = event.requestContext.authorizer;
        return this._getAppById(appId, mustExist);
    }

    async getUserName(event) {
        return event.requestContext.authorizer.eosAccount;
    }
}

export default OauthAuthApi;

