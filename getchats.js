import { ResponseUtil } from './util';
import { ChatDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const chatDao = new ChatDao();

export async function main(event, context) {
    try {
        const {
            appId,
            appKey,
            limit,
            lastEvaluatedKey
        } = JSON.parse(event.body);


        await authApi.authenticate(appId, appKey);
        const eosAccount = await authApi.getUserName(event);
        const chats = await chatDao.findByEOSAccount({
            appId,
            eosAccount,
            limit,
            lastEvaluatedKey
        });
        return ResponseUtil.success({
            status: true,
            chats,
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
