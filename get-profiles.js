import { AppIds, ProfileFetchTypes } from "@smontero/ppp-common";
import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";
import { AuthApiFactory } from "./service";
import { AccessTypes } from "./const";

const profileDao = new ProfileDao();

export async function main(event, context) {

    try {
        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        let { eosAccounts, fetchType } = body;

        if (!eosAccounts) {
            return ResponseUtil.failure("eosAccounts parameter is required");
        }

        fetchType = ProfileFetchTypes.get(fetchType, ProfileFetchTypes.BASE_AND_APP);
        const authApi = AuthApiFactory.getInstance(event);
        const app = await authApi.getApp(event, body, false);
        let appId;
        if (app) {
            ({ appId } = app);
        } else {
            fetchType = ProfileFetchTypes.BASE_ONLY;
            appId = AppIds.BASE_PROFILE_APP;
        }

        const profiles = await profileDao.findByEOSAccounts(appId, eosAccounts, fetchType, AccessTypes.PUBLIC);
        console.log(' profiles: ', profiles)

        return ResponseUtil.success({ status: true, profiles });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
