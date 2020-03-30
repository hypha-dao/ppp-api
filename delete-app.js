import { ResponseUtil } from './util';
import { AppDao } from "./dao";
import { AuthApiFactory } from "./service";

const appDao = new AppDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const { appId } = body;
        if (!appId) {
            throw 'appId is a required parameter';
        }
        const authApi = AuthApiFactory.getInstance(event, body);
        await authApi.getApp();
        const eosAccount = await authApi.getUserName();
        const { ownerAccount, domain } = await appDao.getById(appId);
        if (eosAccount != ownerAccount) {
            throw `User is not owner of the app: ${appId}`;
        }
        await appDao.delete(appId, domain);
        return ResponseUtil.success({
            status: true,
            message: `App: ${appId} was deleted succesfully`,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
