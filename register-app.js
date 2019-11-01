import { ResponseUtil } from './util';
import { AppDao, ProfileDao } from "./dao";
import { App } from "./domain";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const appDao = new AppDao();
const profileDao = new ProfileDao();

export async function main(event, context) {
    const body = JSON.parse(event.body);

    try {
        const { appId } = await authApi.getApp(event, body); //Used to validate that endpoint is called from a valid app
        const eosAccount = await authApi.getUserName(event);
        await profileDao.getVerifiedProfile(appId, eosAccount); //Used to validate that the eosAccount is verified
        const app = new App({
            ...body,
            requesterAccount: eosAccount,
        }, appDao);
        await app.loadDetails();
        await app.save();
        console.log('App: ', app.newState);
        return ResponseUtil.success({
            status: true,
            message: `App record saved successfully`,
            app: app.newState,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
