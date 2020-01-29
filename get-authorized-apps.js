import { ResponseUtil } from './util';
import { AppDao, OauthDao } from "./dao";
import { Oauth } from './domain';
import { AuthApiFactory } from "./service";

const appDao = new AppDao();
const oauthDao = new OauthDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const authApi = AuthApiFactory.getInstance(event);
        const { appId } = await authApi.getApp(event, body);
        const eosAccount = await authApi.getUserName(event);
        const oauth = new Oauth(oauthDao, appDao);
        const authorizations = await oauth.getAuthorizedApps(eosAccount);
        console.log(" Authorizations: ", authorizations);
        return ResponseUtil.success({
            status: true,
            authorizations,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
