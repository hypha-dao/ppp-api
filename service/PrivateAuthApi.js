import BaseAuthApi from './BaseAuthApi';

class PrivateAuthApi extends BaseAuthApi {

    static isThisAuth(event) {
        return event.requestContext.identity && event.requestContext.identity.apiKey;
    }

    async getApp(event, body, mustExist = true) {

        let { originAppId } = body;
        if (!originAppId) {
            if (mustExist) {
                throw 'originAppId parameter is required for private apps';
            } else {
                return null;
            }
        }
        return this._getAppById(originAppId, mustExist);
    }

    async getUserName(event) {
        throw 'UserName can not be obtained for private authentication, it must be on the body of the request';
    }
}

export default PrivateAuthApi;

