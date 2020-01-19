import { ResponseUtil } from './util';
import { AppDao, OauthDao, ScopeDao } from "./dao";
import { AuthCodeRequest } from './domain';
import { AuthApiFactory } from "./service";

const appDao = new AppDao();
const oauthDao = new OauthDao();
const scopeDao = new ScopeDao();
let validScopes = null;

export async function main(event, context) {

    try {
        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const authApi = AuthApiFactory.getInstance(event);
        const eosAccount = await authApi.getUserName(event);
        if (!validScopes) {
            validScopes = await scopeDao.getAllMappedByScope();
        }
        console.log('Valid Scopes: ', validScopes);
        const authCodeRequest = new AuthCodeRequest(appDao, oauthDao, validScopes);
        const oauth = await authCodeRequest.processCodeRequest(body, eosAccount);
        console.log('Oauth: ', oauth);

        return ResponseUtil.success({ status: true, oauth });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
