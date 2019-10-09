import { ResponseUtil } from './util';
import { ChatDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const chatDao = new ChatDao();

export async function main(event, context) {
    try {
        const body = JSON.parse(event.body);
        const {
            limit,
            lastEvaluatedKey
        } = body;


        const { appId } = await authApi.getApp(event, body);
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
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
