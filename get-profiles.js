import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";
import { AuthApi } from "./service";
import { ProfileAccessTypes, ProfileFetchTypes } from "./const";

const authApi = new AuthApi();
const profileDao = new ProfileDao();

export async function main(event, context) {

    try {
        const body = JSON.parse(event.body);
        let { eosAccounts, fetchType } = body;
        fetchType = ProfileFetchTypes.get(fetchType, ProfileFetchTypes.BASE_AND_APP);
        const { appId } = await authApi.getApp(event, body);
        if (!eosAccounts) {
            return ResponseUtil.failure("eosAccounts parameter is required");
        }
        const profiles = await profileDao.findByEOSAccounts(appId, eosAccounts, fetchType, ProfileAccessTypes.PUBLIC);
        console.log(' profiles: ', profiles)

        return ResponseUtil.success({ status: true, profiles });
    } catch (e) {
        return ResponseUtil.failure(e.message);
    }
}
