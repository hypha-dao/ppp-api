import { ParseUtil, ResponseUtil } from './util';
import { AppDao, OauthDao } from "./dao";
import { AccessTokenRequestFactory } from './domain';

const appDao = new AppDao();
const oauthDao = new OauthDao();

export async function main(event, context) {

    try {
        console.log('event: ', event);
        console.log('context: ', context);
        const body = ParseUtil.parseBody(event.body);
        const {
            grant_type,
        } = body;

        const accessTokenRequest = AccessTokenRequestFactory.getInstance(grant_type, appDao, oauthDao);
        const accessTokenResponse = await accessTokenRequest.processRequest(body);
        console.log('Auth Request Context: ', accessTokenResponse);
        return ResponseUtil.success(accessTokenResponse, true);
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e, 400);
    }
}
