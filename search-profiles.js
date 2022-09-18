import * as Sentry from '@sentry/node';
import { AppIds, ProfileFetchTypes } from '@hypha-dao/ppp-common';
import { AuthApiFactory } from "./service";
import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";

Sentry.init({ dsn: process.env.sentryDsn });

const profileDao = new ProfileDao();

export async function main(event, context) {
    try {

        const body = JSON.parse(event.body);
        let {
            appId,
            fetchType,
            limit,
            lastEvaluatedKey,
            search,
        } = body;
        appId = appId || AppIds.BASE_PROFILE_APP;
        fetchType = appId === AppIds.BASE_PROFILE_APP ? ProfileFetchTypes.BASE_ONLY : ProfileFetchTypes.get(fetchType, ProfileFetchTypes.BASE_AND_APP);

        if (appId === AppIds.CURRENT_APP) {
            const authApi = AuthApiFactory.getInstance(event, body);
            const app = await authApi.getApp(false);
            if (app) {
                appId = app.appId;
            } else {
                throw "Can't search current app profiles, when app is not registered";
            }
        }

        let profiles = await profileDao.search({
            appId,
            fetchType,
            search,
            limit,
            lastEvaluatedKey
        });
        return ResponseUtil.success({
            status: true,
            profiles,
        });
    } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return ResponseUtil.failure(e);
    }
}
