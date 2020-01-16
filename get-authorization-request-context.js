import { ResponseUtil } from './util';
import { AppDao, OauthDao, ScopeDao } from "./dao";
import { AuthCodeRequest } from './domain';

const appDao = new AppDao();
const oauthDao = new OauthDao();
const scopeDao = new ScopeDao();
let validScopes = null;

export async function main(event, context) {

    try {
        console.log('event: ', event);
        console.log('context: ', context);

        const requestParams = event.queryStringParameters;
        if (!validScopes) {
            validScopes = await scopeDao.getAllAsMap();
        }
        console.log('Valid Scopes: ', validScopes);
        const authCodeRequest = new AuthCodeRequest(appDao, oauthDao, validScopes);
        const authRequestContext = await authCodeRequest.processInitialRequest(requestParams);
        console.log('Auth Request Context: ', authRequestContext);

        return ResponseUtil.success({ status: true, authRequestContext });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
