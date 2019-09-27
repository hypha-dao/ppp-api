import BaseDao from "./BaseDao";
import { Util } from '../util';

class ContactDao extends BaseDao {
    constructor() {
        super(process.env.contactsTableName, 'appEosAccount', false);
    }

    _getCommInfo(commVerified, comm, maskFn) {
        if (comm == null) {
            return {
                exists: false,
                needsToVerify: false,
            }
        } else {
            return {
                exists: true,
                needsToVerify: !commVerified,
                verifiedAt: commVerified ? commVerified : null,
                mask: maskFn(comm),
            };
        }
    }

    toClientFormat(contact) {
        const {
            contactKey,
            eosAccount,
            commPref,
            emailVerified,
            emailAddress,
            smsVerified,
            smsNumber,
            appData
        } = contact;

        return {
            contactKey,
            eosAccount,
            commPref,
            emailInfo: this._getCommInfo(emailVerified, emailAddress, Util.maskEmail),
            smsInfo: this._getCommInfo(smsVerified, smsNumber, Util.maskSmsNumber),
            appData
        };

    }


    async save(contactRecord) {
        contactRecord.updatedAt = Date.now();
        return this.put(contactRecord);
    }

    async findByEOSAccounts(appId, eosAccounts) {
        const results = await this.batchGetByHash('appEosAccount', this.appAttributes(appId, eosAccounts));
        const map = {};
        for (const result of results) {
            const { eosAccount, appData } = result;
            map[eosAccount] = appData;
        }
        return map;
    }

    async hydrateWithUser(appId, objs, accountProp = 'eosAccount', hydratedProp) {
        return Util.hydrate(
            objs,
            accountProp,
            hydratedProp || `${accountProp}Info`,
            async (eosAccounts) => this.findByEOSAccounts(appId, eosAccounts),
        );
    }

    async findByEOSAccount(appId, eosAccount, clientFormat = false) {
        let contact = await this.get(this.appAttribute(appId, eosAccount));

        if (clientFormat && contact) {
            contact = this.toClientFormat(contact);
        }
        return contact;
    }

    async getByEOSAccount(appId, eosAccount) {
        const contact = await this.findByEOSAccount(appId, eosAccount);
        if (!contact) {
            throw new Error(`EOS Account ${eosAccount} not found for ${appId}`);
        }
        return contact;
    }

    async getOrCreate(appId, eosAccount) {
        let contactRecord = await this.findByEOSAccount(appId, eosAccount);
        console.log("  findByEOSAccount: Query result  : ", contactRecord);
        if (!contactRecord) {
            contactRecord = {
                appEosAccount: this.appAttribute(appId, eosAccount),
                appId: appId,
                eosAccount: eosAccount,
                createdAt: Date.now()
            }
            console.log(" Contact not found. Creating new: ", contactRecord);
        }
        return contactRecord;
    }

    async search({
        appId,
        search,
        limit,
        lastEvaluatedKey
    }) {
        search = (search || '').trim().toLowerCase();
        let KeyConditionExpression = 'appId = :appId';
        let ExpressionAttributeValues = {
            ':appId': appId,
        };
        if (search) {
            KeyConditionExpression += ' and begins_with(eosAccount, :search)';
            ExpressionAttributeValues[':search'] = search;
        }
        const readParams = {
            IndexName: 'GSI_appId_eosAccount',
            KeyConditionExpression,
            ExpressionAttributeValues,
        };

        return await this.query(readParams, limit, lastEvaluatedKey);
    }
}

export default ContactDao;