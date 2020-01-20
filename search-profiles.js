import { AppIds, ProfileFetchTypes } from '@smontero/ppp-common';
import { AuthApiFactory } from "./service";
import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";

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
            const authApi = AuthApiFactory.getInstance(event);
            const app = await authApi.getApp(event, body, false);
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
        return ResponseUtil.failure(e);
    }
}
