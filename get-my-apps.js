import { ResponseUtil } from './util';
import { AppDao } from "./dao";
import { AuthApiFactory } from "./service";

const appDao = new AppDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const authApi = AuthApiFactory.getInstance(event, body);
        const { appId } = await authApi.getApp();
        const eosAccount = await authApi.getUserName();
        const { items: apps } = await appDao.findByOwnerAccount(eosAccount);
        console.log(" Apps: ", apps);
        return ResponseUtil.success({
            status: true,
            apps,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
