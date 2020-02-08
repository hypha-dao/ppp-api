import BaseAuthApi from './BaseAuthApi';

class UnauthenticatedAuthApi extends BaseAuthApi {

    static isThisAuth(event) {
        throw "This should be used when no other authentication is found";
    }


    /* async getApp(event, body, mustExist = true) {
        return this.appDao.getByDomain('app-dev.telos.net', mustExist);
    } */

    async getApp(event, body, mustExist = true) {

        let app = null;
        let { originAppId } = body;
        const { headers } = event;
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

    async getUserName(event) {
        throw "A username can't be obtained for unauthenticated users";
    }

}

export default UnauthenticatedAuthApi;

