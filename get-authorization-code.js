import { ResponseUtil } from './util';
import { AppDao, OauthDao, ScopeDao, ProfileDao } from "./dao";
import { AuthCodeRequest, Scopes } from './domain';
import { AuthApiFactory } from "./service";
import { AppIds } from '@smontero/ppp-common';

const appDao = new AppDao();
const oauthDao = new OauthDao();
const scopeDao = new ScopeDao();
const profileDao = new ProfileDao();
const scopes = new Scopes(scopeDao);

export async function main(event, context) {

    try {
        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const authApi = AuthApiFactory.getInstance(event);
        const eosAccount = await authApi.getUserName(event);
        const authCodeRequest = new AuthCodeRequest(appDao, oauthDao, scopes);
        const profile = await profileDao.getProfile(AppIds.BASE_PROFILE_APP, eosAccount, false);
        const oauth = await authCodeRequest.processCodeRequest(body, profile);
        console.log('Oauth: ', oauth);

        return ResponseUtil.success({ status: true, oauth });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
