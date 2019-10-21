import BaseDao from "./BaseDao";

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
    }

    async findByEOSAccount(
        {
            appId,
            eosAccount,
            limit,
            lastEvaluatedKey
        }) {

        const appEosAccount = this.appAttribute(appId, eosAccount);
        const readParams = {
            IndexName: 'GSI_appEosAccount_sentAt',
            KeyConditionExpression: 'appEosAccount = :appEosAccount',
            ExpressionAttributeValues: {
                ':appEosAccount': appEosAccount,
            },
            ScanIndexForward: false,
        };

        return this.query(readParams, limit, lastEvaluatedKey);
    }

    async search({
        appId,
        eosAccount,
        search,
        limit,
        lastEvaluatedKey
    }) {
        search = (search || '').trim().toLowerCase();

        if (!search) {
            return this.findByEOSAccount({
                appId,
                eosAccount,
                limit,
                lastEvaluatedKey,
            });
        }
        const appEosAccount = this.appAttribute(appId, eosAccount);
        const readParams = {
            KeyConditionExpression: 'appEosAccount = :appEosAccount and begins_with(counterPartyAccount, :search)',
            ExpressionAttributeValues: {
                ':appEosAccount': appEosAccount,
                ':search': search,
            },
        };

        return this.query(readParams, limit, lastEvaluatedKey);
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

    async updateCounterPartyDetails(counterPartyAccount, counterPartyDetails) {
        const readParams = {
            IndexName: 'GSI_counterPartyAccount_sentAt',
            KeyConditionExpression: 'counterPartyAccount = :counterPartyAccount',
            ExpressionAttributeValues: {
                ':counterPartyAccount': counterPartyAccount,
            },
        };

        await this.updateItems(readParams, (chat) => {
            chat.counterParty = counterPartyDetails;
            return chat;
        });
    }
}

export default ChatDao;