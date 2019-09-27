import { ResponseUtil } from './util';
import { MessageDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const messageDao = new MessageDao();

export async function main(event, context) {

    try {
        const {
            appId,
            appKey,
            eosAccount2,
            limit,
            lastEvaluatedKey
        } = JSON.parse(event.body);

        await authApi.authenticate(appId, appKey);
        if (!eosAccount2) {
            return ResponseUtil.failure("eosAccount2 parameter is required");
        }
        const eosAccount1 = await authApi.getUserName(event);
        const messages = await messageDao.getByParticipants({
            appId,
            eosAccount1,
            eosAccount2,
            limit,
            lastEvaluatedKey
        });
        return ResponseUtil.success({
            status: true,
            messages,
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
