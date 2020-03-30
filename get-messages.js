import { ResponseUtil } from './util';
import { MessageDao } from "./dao";
import { AuthApiFactory } from "./service";

const messageDao = new MessageDao();

export async function main(event, context) {

    try {
        const body = JSON.parse(event.body);
        const {
            eosAccount2,
            limit,
            lastEvaluatedKey
        } = body;
        const authApi = AuthApiFactory.getInstance(event, body);
        const { appId } = await authApi.getApp();
        if (!eosAccount2) {
            return ResponseUtil.failure("eosAccount2 parameter is required");
        }
        const eosAccount1 = await authApi.getUserName();
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
        console.error(e);
        return ResponseUtil.failure(e);
    }
}
