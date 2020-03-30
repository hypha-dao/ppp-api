import { OauthAppStatus } from '@smontero/ppp-common';
import { ResponseUtil } from './util';
import { AppDao, ProfileDao } from "./dao";
import { AuthApiFactory } from "./service";
import App from './domain/App';

const appDao = new AppDao();
const profileDao = new ProfileDao();

export async function main(event, context) {
    try {
        const body = JSON.parse(event.body);
        const { appId, enable } = body;

        if (!appId || enable == null) {
            throw 'appId and enable are required parameters';
        }

        const authApi = AuthApiFactory.getInstance(event, body);
        await authApi.getApp(); //Used to validate that endpoint is called from a valid app
        const eosAccount = await authApi.getUserName();
        await profileDao.getVerifiedProfile(appId, eosAccount); //Used to validate that the eosAccount is verified
        const app = new App(appDao);
        await app.updateOauthStatus(appId, eosAccount, enable ? OauthAppStatus.ENABLED : OauthAppStatus.DISABLED_BY_APP);
        return ResponseUtil.success({
            status: true,
            message: `App oauth status updated successfully`,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
