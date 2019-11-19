import { ResponseUtil } from './util';
import { ProfileDao } from "./dao";

const profileDao = new ProfileDao();

export async function main(event, context) {
    try {

        const body = JSON.parse(event.body);
        const {
            limit,
            lastEvaluatedKey,
            search,
        } = body;

        let profiles = await profileDao.search({
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
