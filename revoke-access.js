import { OauthTokenStatus } from '@smontero/ppp-common';
import { ResponseUtil } from './util';
import { OauthDao } from "./dao";
import { AuthApiFactory } from "./service";

const oauthDao = new OauthDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        const { appId } = body;
        if (!appId) {
            return ResponseUtil.failure("appId parameter is required");
        }
        const authApi = AuthApiFactory.getInstance(event);
        await authApi.getApp(event, body);
        const eosAccount = await authApi.getUserName(event);
        await oauthDao.revokeByAppIdAndEosAccount(appId, eosAccount, OauthTokenStatus.REVOKED_BY_USER);
        return ResponseUtil.success({
            status: true,
            message: `App access revoked successfully`,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
