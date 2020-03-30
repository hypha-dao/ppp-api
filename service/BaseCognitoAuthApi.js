import BaseAuthApi from './BaseAuthApi';

class BaseCognitoAuthApi extends BaseAuthApi {


    async getApp(mustExist = true) {

        let app = null;
        let { originAppId } = this.body;
        const { headers } = this.event;
        const origin = headers ? headers.origin : null;
        if (!origin && !originAppId) {
            if (mustExist) {
                throw 'originAppId parameter is required for standalone apps';
            } else {
                return null;
            }
        }
        if (originAppId) {
            app = await this._getAppById(originAppId, mustExist);
        } else {
            const url = new URL(origin);
            app = await this.appDao.getByDomain(url.hostname, mustExist);
        }
        return app;
    }
}

export default BaseCognitoAuthApi;

