import { AppIds, ProfileFetchTypes } from "@smontero/ppp-common";
import BaseDao from "./BaseDao";
import { Util } from '../util';
import { AccessTypes } from '../const';
import { Profile } from '../domain';

class ProfileDao extends BaseDao {
    constructor() {
        super(process.env.profileTableName,
            {
                hashProp: 'eosAccount',
                rangeProp: 'appId',
            },
            true);
    }

    async save(profile) {
        profile = { ...profile };
        const { appData } = profile;
        delete profile.appData;
        let items = [profile];
        if (appData) {
            items.push(appData);
        }
        await this.transactPut(items);
    }

    async _findByEOSAccountsRaw(appId, eosAccounts, fetchType) {
        eosAccounts = Util.removeDuplicates(eosAccounts);
        const keys = this._getKeysByFetchType(appId, eosAccounts, fetchType);
        console.log(`Keys used for finding eosAccounts: `, keys);
        const results = await this.batchGet(keys);
        console.log(`Results: `, results);
        return results;
    }

    async findByEOSAccounts(appId, eosAccounts, fetchType, accessType) {
        console.log(`Finding profiles for eosAccounts: ${eosAccounts}, appId: ${appId}, fetchType: ${fetchType}, accessType: ${accessType}`);
        const results = await this._findByEOSAccountsRaw(appId, eosAccounts, fetchType);
        return this._processResults(results, accessType);
    }

    _processResults(results, accessType) {
        const map = {};
        for (const result of results) {
            const { eosAccount, appId } = result;
            let data = Profile.restrictAccess(result, accessType);
            if (appId !== AppIds.BASE_PROFILE_APP) {
                data = { appData: data };
            }
            map[eosAccount] = { ...data, ...map[eosAccount] };
        }
        return map;
    }



    async hydrateWithUser(appId, objs, accountProp = 'eosAccount', hydratedProp) {
        return Util.hydrate(
            objs,
            accountProp,
            hydratedProp || `${accountProp}Info`,
            async (eosAccounts) => this.findByEOSAccounts(appId, eosAccounts, ProfileFetchTypes.BASE_ONLY, AccessTypes.PUBLIC),
        );
    }

    _getKeysByFetchType(appId, eosAccounts, fetchType = ProfileFetchTypes.BASE_AND_APP) {
        switch (fetchType) {
            case ProfileFetchTypes.BASE_ONLY:
                return [[eosAccounts, AppIds.BASE_PROFILE_APP]];
            case ProfileFetchTypes.APP_ONLY:
                return [[eosAccounts, appId]];
            case ProfileFetchTypes.BASE_AND_APP:
                return [
                    [eosAccounts, AppIds.BASE_PROFILE_APP],
                    [eosAccounts, appId]
                ];
        }
    }

    async findByEOSAccount(appId, eosAccount, fetchType, accessType) {
        let { [eosAccount]: profile } = await this.findByEOSAccounts(appId, eosAccount, fetchType, accessType);
        return profile;
    }

    async getByEOSAccount(appId, eosAccount, mustExist = true) {
        const profile = await this.findByEOSAccount(appId, eosAccount, ProfileFetchTypes.BASE_ONLY, AccessTypes.ADMIN);
        if (mustExist && !profile) {
            throw new Error(`EOS Account ${eosAccount} not found for ${appId}`);
        }
        return profile;
    }

    async getProfile(appId, eosAccount, mustExist = true) {
        const profile = await this.getByEOSAccount(appId, eosAccount, mustExist);
        return new Profile(appId, eosAccount, profile);
    }

    async getVerifiedProfile(appId, eosAccount) {
        const profile = await this.getProfile(appId, eosAccount);
        console.log('Is verified: ', profile.isVerified());
        if (!profile.isVerified()) {
            throw `${eosAccount} account is not verfied`;
        }
        return profile;
    }

    async search({
        appId,
        fetchType,
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
            ProjectionExpression: "eosAccount, publicData",
        };
        const results = await this.query(readParams, limit, lastEvaluatedKey);

        console.log('ProfileDao.search, initial results: ', results);
        if (appId === AppIds.BASE_PROFILE_APP) {
            return results;
        }
        let { items } = results;
        if (fetchType !== ProfileFetchTypes.APP_ONLY) {
            const eosAccounts = [];
            for (const item of items) {
                eosAccounts.push(item.eosAccount);
            }
            const baseItems = await this._findByEOSAccountsRaw(appId, eosAccounts, ProfileFetchTypes.BASE_ONLY);
            items = baseItems.concat(items);
        }
        results.items = Object.values(this._processResults(items, AccessTypes.PUBLIC));
        return results;
    }

    async updateAppDetails(appId, appDetails) {
        const readParams = {
            IndexName: 'GSI_appId_eosAccount',
            KeyConditionExpression: 'appId = :appId',
            ExpressionAttributeValues: {
                ':appId': appId,
            },
        };

        await this.updateItems(readParams, (profile) => {
            profile.app = appDetails;
            return profile;
        });
    }
}

export default ProfileDao;