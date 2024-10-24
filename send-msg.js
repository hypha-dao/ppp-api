// import * as Sentry from '@sentry/node';
import { ResponseUtil } from './util';
import { ProfileDao, MessageDao } from "./dao";
import { AuthApiFactory, PrivateAuthApi } from "./service";
import { Message } from "./domain";

// Sentry.init({ dsn: process.env.sentryDsn });

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
        const authApi = AuthApiFactory.getInstance(event, body);
        const app = await authApi.getApp();
        const { appId } = app;
        if (PrivateAuthApi.isThisAuth(event)) {
            ({ senderAccount } = body);
            if (!senderAccount) {
                throw "senderAccount is required";
            }
        } else {
            senderAccount = await authApi.getUserName();
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
        // Sentry.captureException(e);
        return ResponseUtil.failure(e);
    }
}
