import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";
import { AuthApi } from "./service";
import { ProfileFetchTypes, ProfileAccessTypes } from "./const";

const authApi = new AuthApi();
const profileDao = new ProfileDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body);
        let { fetchType } = body;
        fetchType = ProfileFetchTypes.get(fetchType, ProfileFetchTypes.BASE_AND_APP);
        const { appId } = await authApi.getApp(event, body);
        const eosAccount = await authApi.getUserName(event);
        const profile = await profileDao.findByEOSAccount(appId, eosAccount, fetchType, ProfileAccessTypes.OWNER);
        console.log(" Profile Record: ", profile)
        return ResponseUtil.success({
            status: true,
            profile,
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
