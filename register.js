// import * as Sentry from '@sentry/node';
import { ProfileFetchTypes } from "@hypha-dao/ppp-common";
import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";
import { Profile } from "./domain";
import { AuthApiFactory } from "./service";
import { AccessTypes } from "./const";

// Sentry.init({ dsn: process.env.sentryDsn });

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
        const authApi = AuthApiFactory.getInstance(event, body);
        const app = await authApi.getApp();
        const { appId } = app;
        if (!(smsNumber || emailAddress || commPref || appData)) {
            return ResponseUtil.failure("Either smsNumber or emailAddress or commPref or appData are required");
        }
        const eosAccount = await authApi.getUserName();

        let profile = await profileDao.findByEOSAccount(appId, eosAccount, ProfileFetchTypes.BASE_AND_APP, AccessTypes.ADMIN);
        profile = new Profile(app, eosAccount, profile);
        await profile.update(body);
        console.log(" Profile Record before saveContact  : ", profile.profile);

        await profileDao.save(profile.profile);
        return ResponseUtil.success({
            status: true,
            message: `Profile record saved successfully`,
            profile: profile.get(AccessTypes.OWNER),
        });
    } catch (e) {
        console.error(e);
        // Sentry.captureException(e);
        return ResponseUtil.failure(e);
    }
}
