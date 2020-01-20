import { ProfileFetchTypes } from "@smontero/ppp-common";
import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";
import { Profile } from "./domain";
import { AuthApiFactory } from "./service";
import { ProfileAccessTypes } from "./const";

const profileDao = new ProfileDao();

export async function main(event, context) {
    const body = JSON.parse(event.body);
    let {
        smsNumber,
        emailAddress,
        appData,
        commPref,
    } = body;

    try {
        const authApi = AuthApiFactory.getInstance(event);
        const app = await authApi.getApp(event, body);
        const { appId } = app;
        if (!(smsNumber || emailAddress || commPref || appData)) {
            return ResponseUtil.failure("Either smsNumber or emailAddress or commPref or appData are required");
        }
        const eosAccount = await authApi.getUserName(event);

        let profile = await profileDao.findByEOSAccount(appId, eosAccount, ProfileFetchTypes.BASE_AND_APP, ProfileAccessTypes.ADMIN);
        profile = new Profile(app, eosAccount, profile);
        await profile.update(body);
        console.log(" Profile Record before saveContact  : ", profile.profile);

        await profileDao.save(profile.profile);
        return ResponseUtil.success({
            status: true,
            message: `Profile record saved successfully`,
            profile: profile.get(ProfileAccessTypes.OWNER),
        });
    } catch (e) {
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
