import { ProfileFetchTypes } from "@smontero/ppp-common";
import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";
import { AuthApiFactory, OauthAuthApi } from "./service";
import { AccessTypes } from "./const";

const profileDao = new ProfileDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const body = JSON.parse(event.body) || {};
        const authApi = AuthApiFactory.getInstance(event, body);
        const eosAccount = await authApi.getUserName();
        if(authApi instanceof OauthAuthApi){
            if(!authApi.hasScope('profile_read')){
                return ResponseUtil.success({
                    status: true,
                    profile:{
                        eosAccount,
                    },
                });        
            }
        }
        
        let { fetchType } = body;
        fetchType = ProfileFetchTypes.get(fetchType, ProfileFetchTypes.BASE_AND_APP);
        const { appId } = await authApi.getApp();
        const profile = await profileDao.findByEOSAccount(appId, eosAccount, fetchType, AccessTypes.OWNER);
        console.log(" Profile Record: ", profile);
        return ResponseUtil.success({
            status: true,
            profile,
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
