import BaseDao from "./BaseDao";
import { ContactDao } from '.';

class ChatDao extends BaseDao {
    constructor() {
        super(
            process.env.chatsTableName,
            {
                hashProp: 'eosAccount',
                rangeProp: 'counterPartyAccount'
            },
            false
        );
        this.contactDao = new ContactDao();
    }

    async findByEOSAccount(
        {
            appId,
            eosAccount,
            limit,
            lastEvaluatedKey
        }, hydrateUser = true) {

        const appEosAccount = this.appAttribute(appId, eosAccount);
        const readParams = {
            IndexName: 'GSI_appEosAccountSentAt',
            KeyConditionExpression: 'appEosAccount = :appEosAccount',
            ExpressionAttributeValues: {
                ':appEosAccount': appEosAccount,
            },
            ScanIndexForward: false,
        };

        const results = await this.query(readParams, limit, lastEvaluatedKey);

        if (hydrateUser) {
            results.items = await this.contactDao.hydrateWithUser(appId, results.items, 'counterPartyAccount');
        }
        return results;
    }

    getChatItemsFromMessage(messageRecord) {
        const {
            appId,
            eosAccount,
            senderAccount,
            message,
            sentAt
        } = messageRecord;

        return [
            {
                Put: {
                    TableName: this.tableName,
                    Item: {
                        appEosAccount: this.appAttribute(appId, eosAccount),
                        eosAccount,
                        appId,
                        sentAt,
                        message,
                        counterPartyAccount: senderAccount,
                        isSender: false,
                    }
                },
            },
            {
                Put: {
                    TableName: this.tableName,
                    Item: {
                        appEosAccount: this.appAttribute(appId, senderAccount),
                        eosAccount: senderAccount,
                        appId,
                        sentAt,
                        message,
                        counterPartyAccount: eosAccount,
                        isSender: true,
                    }
                }
            }
        ];
    }
}

export default ChatDao;