import { ResponseUtil } from './util';
import { AppDao, ProfileDao } from "./dao";
import { AppFactory } from "./domain";
import { AuthApiFactory } from "./service";

const appDao = new AppDao();
const profileDao = new ProfileDao();

export async function main(event, context) {
    try {
        const body = JSON.parse(event.body);
        const { type } = body;

        if (!type) {
            throw 'type is a required parameter';
        }

        const authApi = AuthApiFactory.getInstance(event, body);
        const { appId } = await authApi.getApp(); //Used to validate that endpoint is called from a valid app
        const eosAccount = await authApi.getUserName();
        await profileDao.getVerifiedProfile(appId, eosAccount); //Used to validate that the eosAccount is verified
        const app = AppFactory.getInstance(type, appDao);
        await app.register({
            ...body,
            requesterAccount: eosAccount,
        });
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
