import { ResponseUtil } from './util';
import { AppDao } from "./dao";
import { App } from "./domain";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const appDao = new AppDao();

export async function main(event, context) {
    const body = JSON.parse(event.body);

    try {
        await authApi.getApp(event, body); //Used to validate that endpoint is called from a valid app
        const eosAccount = await authApi.getUserName(event);
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
