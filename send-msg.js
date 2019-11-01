import { ResponseUtil } from './util';
import { ProfileDao, MessageDao } from "./dao";
import { AuthApi } from "./service";
import { Message } from "./domain";

const authApi = new AuthApi();
const profileDao = new ProfileDao();
const messageDao = new MessageDao();

export async function main(event, context) {

    try {
        console.log('event: ', event);
        const body = JSON.parse(event.body);

        const {
            eosAccount,
            subject,
            message,
        } = body;

        if (!eosAccount || !message) {
            throw "eosAccount and message are required";
        }
        let senderAccount = null;
        const app = await authApi.getApp(event, body);
        const { appId } = app;
        if (authApi.isCognitoAuth(event)) {
            senderAccount = await authApi.getUserName(event);
        } else {
            ({ senderAccount } = body);
            if (!senderAccount) {
                throw "senderAccount is required";
            }
        }

        const { profile: receiver } = await profileDao.getVerifiedProfile(appId, eosAccount);
        const { profile: sender } = await profileDao.getVerifiedProfile(appId, senderAccount);

        const msg = new Message({
            app,
            subject,
            message,
            sender,
            receiver,
        });
        await msg.send();
        const messageKey = await messageDao.save(msg.records);
        return ResponseUtil.success({ status: true, message: `Message sent successfully.`, messageKey: messageKey });
    } catch (e) {
        console.error(JSON.stringify(e, null, 2));
        return ResponseUtil.failure(e);
    }
}
