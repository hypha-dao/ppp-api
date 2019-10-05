import BaseDao from "./BaseDao";
import { ProfileDao } from '.';

class ChatDao extends BaseDao {
    constructor() {
        super(
            process.env.chatTableName,
            {
                hashProp: 'eosAccount',
                rangeProp: 'counterPartyAccount'
            },
            false
        );
        this.profileDao = new ProfileDao();
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
            IndexName: 'GSI_appEosAccount_sentAt',
            KeyConditionExpression: 'appEosAccount = :appEosAccount',
            ExpressionAttributeValues: {
                ':appEosAccount': appEosAccount,
            },
            ScanIndexForward: false,
        };

        const results = await this.query(readParams, limit, lastEvaluatedKey);

        if (hydrateUser) {
            results.items = await this.profileDao.hydrateWithUser(appId, results.items, 'counterPartyAccount');
        }
        return results;
    }

    getChatItems(chatRecords) {
        const {
            receiver,
            sender,
            receiver: {
                appId,
                eosAccount,
                counterPartyAccount: senderAccount,
            }
        } = chatRecords;

        receiver.appEosAccount = this.appAttribute(appId, eosAccount);
        sender.appEosAccount = this.appAttribute(appId, senderAccount);
        return this._toTransactPutItems([
            receiver,
            sender,
        ]);
    }
}

export default ChatDao;