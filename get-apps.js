import { ResponseUtil } from './util';
import { AppDao } from "./dao";
import { AuthApiFactory } from "./service";

const appDao = new AppDao();

export async function main(event, context) {

    try {
        const body = JSON.parse(event.body);
        let { appIds } = body;
        const authApi = AuthApiFactory.getInstance(event);
        const { appId } = await authApi.getApp(event, body);
        if (!appIds) {
            return ResponseUtil.failure("appIds parameter is required");
        }
        const apps = await appDao.findBasicByIds(appIds);
        console.log(' apps: ', apps)

        return ResponseUtil.success({ status: true, apps });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
