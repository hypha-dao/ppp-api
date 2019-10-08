import { ResponseUtil } from './util';
import { AppDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const appDao = new AppDao();

export async function main(event, context) {

    try {
        const body = JSON.parse(event.body);
        let { appIds } = body;
        const { appId } = await authApi.getApp(event, body);
        if (!appIds) {
            return ResponseUtil.failure("appIds parameter is required");
        }
        const apps = await appDao.findByIds(appIds);
        console.log(' apps: ', apps)

        return ResponseUtil.success({ status: true, apps });
    } catch (e) {
        return ResponseUtil.failure(e.message);
    }
}
