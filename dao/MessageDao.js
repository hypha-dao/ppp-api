import uuid from "uuid";
import BaseDao from "./BaseDao";
import ChatDao from './ChatDao';

class MessageDao extends BaseDao {
    constructor() {
        super(
            process.env.messagesTableName,
            'messageKey',
            false
        );
        this.chatDao = new ChatDao();
    }

    participantsAttribute(appId, eosAccount1, eosAccount2) {
        const participants = eosAccount1 < eosAccount2 ? `${eosAccount1}/${eosAccount2}` : `${eosAccount2}/${eosAccount1}`;
        return this.appAttribute(appId, participants);
    }

    async getByParticipants(
        {
            appId,
            eosAccount1,
            eosAccount2,
            limit,
            lastEvaluatedKey,
        }) {
        const appParticipants = this.participantsAttribute(appId, eosAccount1, eosAccount2);
        console.log('getMessagesByParticipants- appParticipants: ', appParticipants);
        const readParams = {
            IndexName: 'GSI_appParticipants',
            KeyConditionExpression: 'appParticipants = :appParticipants',
            ExpressionAttributeValues: {
                ':appParticipants': appParticipants,
            },
            ScanIndexForward: false,
        };

        return await this.query(readParams, limit, lastEvaluatedKey);
    }

    async save(messageRecord) {
        const { appId, eosAccount, senderAccount } = messageRecord;
        messageRecord.messageKey = uuid.v1();
        messageRecord.sentAt = Date.now();
        messageRecord.appParticipants = this.participantsAttribute(appId, eosAccount, senderAccount);

        let transactItems = this.chatDao.getChatItemsFromMessage(messageRecord);
        transactItems.push({
            Put: {
                Item: messageRecord
            },
        });
        console.log("transact items : ", transactItems);
        await this.transactWrite(transactItems);
        return messageRecord.messageKey;
    }

}

export default MessageDao;