import { ResponseUtil } from './util';
import { AppDao, ContactDao, MessageDao } from "./dao";
import { AuthApi, commApi } from "./service";

const authApi = new AuthApi();
const appDao = new AppDao();
const contactDao = new ContactDao();
const messageDao = new MessageDao();

export async function main(event, context) {

    try {
        console.log('event: ', event);
        const data = JSON.parse(event.body);

        const {
            eosAccount,
            subject,
            message,
            appId,
            appKey,
        } = data;

        if (!eosAccount || !message || !appId || !appKey) {
            return ResponseUtil.failure("appId, appKey, eosAccount and message are required");
        }
        let senderAccount = null;
        if (authApi.isCognitoAuth(event)) {
            senderAccount = await authApi.getUserName(event);
        } else {
            ({ senderAccount } = data);
            if (!senderAccount) {
                return ResponseUtil.failure("senderAccount is required");
            }
        }

        console.log(" Data object: ", data)
        await authApi.authenticate(appId, appKey);

        let messageRecord = {
            appId: appId,
            eosAccount: eosAccount,
            subject: subject ? subject : message.substring(0, 15) + '...',
            message: `${message}`,
            senderAccount: senderAccount,
        };

        console.log(messageRecord);

        const {
            commPref,
            emailAddress,
            smsNumber,
        } = await contactDao.getByEOSAccount(appId, eosAccount);
        const app = await appDao.getById(appId);
        let completeMsg = `Message from ${senderAccount}`;
        if (app) {
            completeMsg += ` sent through ${app.appName} App`;
        }
        completeMsg += `:\n ${message}`;
        if (commPref == 'EMAIL' || (!commPref && emailAddress)) {
            const r = await commApi.sendEmail(emailAddress, messageRecord.subject, completeMsg);
            messageRecord.emailReceipt = r[0].headers['x-message-id'];
            messageRecord.emailAddress = emailAddress;
        } else if (commPref == 'SMS' || (!commPref && smsNumber)) {
            const msg = await commApi.sendSMS(smsNumber, completeMsg);
            messageRecord.smsReceipt = msg.sid;
            messageRecord.smsNumber = smsNumber;
        } else {
            return ResponseUtil.failure('Conditions not met to satisfy recipient. Check emailAddress, smsNumber, and commPref of account.');
        }

        const messageKey = await messageDao.save(messageRecord);

        return ResponseUtil.success({ status: true, message: `Message sent successfully.`, messageKey: messageKey });
    } catch (e) {
        console.log(JSON.stringify(e, null, 2));
        return ResponseUtil.failure(e.message);
    }
}
