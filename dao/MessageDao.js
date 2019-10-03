import BaseDao from "./BaseDao";
import ChatDao from './ChatDao';

class MessageDao extends BaseDao {
    constructor() {
        super(
            process.env.messageTableName,
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
            IndexName: 'GSI_appParticipants_sentAt',
            KeyConditionExpression: 'appParticipants = :appParticipants',
            ExpressionAttributeValues: {
                ':appParticipants': appParticipants,
            },
            ScanIndexForward: false,
        };

        return await this.query(readParams, limit, lastEvaluatedKey);
    }

    async save(records) {
        const {
            msgRecord,
            chatRecords,
            msgRecord: {
                appId,
                eosAccount,
                senderAccount,
            } } = records;
        msgRecord.appParticipants = this.participantsAttribute(appId, eosAccount, senderAccount);

        let transactItems = this.chatDao.getChatItems(chatRecords);
        transactItems.push({
            Put: {
                Item: msgRecord
            },
        });
        await this.transactWrite(transactItems);
        return msgRecord.messageKey;
    }
}

export default MessageDao;