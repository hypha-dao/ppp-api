import uuid from "uuid";
import { Chat } from "../domain";
import { commApi } from "../service";

class Message {

    constructor({
        app,
        subject,
        message,
        sender,
        receiver
    }) {
        this.app = app;
        this.subject = subject || message.substring(0, 20) + '...';
        this.message = message;
        this.sender = sender;
        this.receiver = receiver;
        this.fullMessage = `Message from ${sender.eosAccount} sent through ${app.appName} App:\n ${message}`;
    }

    async send() {
        const {
            commPref,
            emailAddress,
            smsNumber,
        } = this.receiver;

        const base = {
            appId: this.app.appId,
            sentAt: Date.now(),
            subject: this.subject,
            message: this.message,
        };

        const msgRecord = {
            ...base,
            messageKey: uuid.v1(),
            senderAccount: this.sender.eosAccount,
            eosAccount: this.receiver.eosAccount,
        };
        const chatRecords = {
            receiver: new Chat(base, this.sender, this.receiver, false).chat,
            sender: new Chat(base, this.sender, this.receiver, true).chat,
        }
        console.log('Message Record: ', msgRecord);
        console.log('Chat Records: ', chatRecords);

        if (commPref == 'EMAIL' || (!commPref && emailAddress)) {
            const r = await commApi.sendEmail(emailAddress, this.subject, this.fullMessage);
            msgRecord.emailReceipt = r[0].headers['x-message-id'];
            msgRecord.emailAddress = emailAddress;
        } else if (commPref == 'SMS' || (!commPref && smsNumber)) {
            const msg = await commApi.sendSMS(smsNumber, this.fullMessage);
            msgRecord.smsReceipt = msg.sid;
            msgRecord.smsNumber = smsNumber;
        } else {
            throw 'Conditions not met to satisfy recipient. Check emailAddress, smsNumber, and commPref of account.';
        }

        this.records = {
            msgRecord,
            chatRecords,
        };
    }


}

export default Message;