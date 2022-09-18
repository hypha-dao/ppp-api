import BaseDao from "./BaseDao";
import { AppTypes } from '@hypha-dao/ppp-common';
import { Util } from "../util";


const ExpressionAttributeNames = {
    '#d': 'domain',
};

class AppDao extends BaseDao {
    constructor() {
        super(process.env.appTableName, 'appId', false);
    }

    async getById(appId, mustExist = true) {
        const app = await this.get(appId);
        if (!app && mustExist) {
            throw Error(`app with appId: ${appId} does not exist`);
        }
        return app;
    }

    async findByIds(appIds, queryOpts) {
        appIds = Util.removeDuplicates(appIds);
        return this.batchGetMap(appIds, 'appId', queryOpts);
    }

    async findBasicByIds(appIds) {
        return this.findByIds(appIds, {
            ProjectionExpression: 'appId, icon, #n, shortName, #t, oauthAppStatus',
            ExpressionAttributeNames: {
                '#n': 'name',
                '#t': 'type',
            }
        });
    }


    async findByDomain(domain) {
        return this.queryOne({
            IndexName: 'GSI_domain',
            KeyConditionExpression: '#d = :domain',
            ExpressionAttributeValues: {
                ':domain': domain,
            },
            ExpressionAttributeNames,
        });
    }

    async findByOwnerAccount(ownerAccount) {
        return this.query({
            IndexName: 'GSI_ownerAccount',
            KeyConditionExpression: 'ownerAccount = :ownerAccount',
            ExpressionAttributeValues: {
                ':ownerAccount': ownerAccount,
            },
        });
    }

    async getByDomain(domain, mustExist = true) {
        const app = await this.findByDomain(domain);
        if (!app && mustExist) {
            throw Error(`app with domain: ${domain} does not exist`);
        }
        return app;
    }

    async updateOauthStatus({
        appId,
        oauthAppStatus,
        oauthStatusChangedAt,
    }) {
        const query = {
            UpdateExpression: 'set oauthAppStatus = :oauthAppStatus, oauthStatusChangedAt = :oauthStatusChangedAt',
            ExpressionAttributeValues: {
                ":oauthAppStatus": oauthAppStatus,
                ":oauthStatusChangedAt": oauthStatusChangedAt,
            }
        };
        await this.update(appId, null, query);
    }

    async save(appD) {
        try {
            const {
                type,
                newState,
                newState: {
                    appId,
                    domain,
                },
                oldState
            } = appD;
            const items = this._toTransactPutItems(newState);
            if (type === AppTypes.WEB_APP) {
                const appDomainQuery = {
                    TableName: process.env.uniqueAppDomainTableName,
                    Item: {
                        domain,
                        appId,
                    },
                };
                if (appD.isNewDomain()) {
                    this.notExistsCondition(appDomainQuery, '#d');
                    appDomainQuery.ExpressionAttributeNames = ExpressionAttributeNames;
                    if (!appD.isNewApp()) {
                        const deleteQuery = {
                            TableName: process.env.uniqueAppDomainTableName,
                            Key: {
                                domain: oldState.domain,
                            },
                        };
                        this.valueCondition(deleteQuery, 'appId', appId);
                        items.push({
                            Delete: deleteQuery,
                        });
                    }
                } else {
                    this.valueCondition(appDomainQuery, 'appId', appId);
                }
                items.push({
                    Put: appDomainQuery,
                });
            }
            await this.transactWrite(items);
        } catch (error) {
            console.error('Error saving app: ', error);
            if (error.code === 'TransactionCanceledException') {
                throw "Domain asociated to the app is already in use";
            }
            throw error;
        }
    }

    async delete(appId, domain) {
        const items = [
            {
                Delete: {
                    Key: {
                        appId,
                    },
                }
            }
        ];
        if (domain) {
            items.push({
                Delete: {
                    TableName: process.env.uniqueAppDomainTableName,
                    Key: {
                        domain,
                    },
                }
            });
        }
        await this.transactWrite(items);
    }

}

export default AppDao;