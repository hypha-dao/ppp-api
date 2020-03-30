import { ResponseUtil } from './util';
import { AppDao, OauthDao, ScopeDao } from "./dao";
import { Oauth, Scopes } from './domain';
import { AuthApiFactory } from "./service";

const appDao = new AppDao();
const oauthDao = new OauthDao();
const scopeDao = new ScopeDao();
const scopes = new Scopes(scopeDao);

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const authApi = AuthApiFactory.getInstance(event, body);
        const { appId } = await authApi.getApp();
        const eosAccount = await authApi.getUserName();
        const oauth = new Oauth(oauthDao, appDao);
        const authorizations = await oauth.getAuthorizedApps(eosAccount, scopes);
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
