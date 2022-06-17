import BaseAuthApi from './BaseAuthApi';
import { UniqueAppDomainDao } from '../dao';

class BaseCognitoAuthApi extends BaseAuthApi {

    constructor(){
       super();
       this.uniqueAppDomainDao = new UniqueAppDomainDao()
    }

    async getApp(mustExist = true) {

        let app = null;
        let { originAppId } = this.body;
        const { headers } = this.event;
        const origin = headers ? (headers.origin || headers.Origin) : null;
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
            const uniqueAppDomain = await this.uniqueAppDomainDao.getByDomain(url.hostname, mustExist);
            app = await this._getAppById(uniqueAppDomain.appId, mustExist);
        }
        return app;
    }
}

export default BaseCognitoAuthApi;

