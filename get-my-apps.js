import { ResponseUtil } from './util';
import { AppDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const appDao = new AppDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const { appId } = await authApi.getApp(event, body);
        const eosAccount = await authApi.getUserName(event);
        const apps = await appDao.findByOwnerAccount(eosAccount);
        console.log(" Apps: ", apps);
        return ResponseUtil.success({
            status: true,
            apps,
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
