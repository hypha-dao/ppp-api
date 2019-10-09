import BaseDao from "./BaseDao";
import { Util } from "../util";


const ExpressionAttributeNames = {
    '#d': 'domain',
};

class AppDao extends BaseDao {
    constructor() {
        super(process.env.appTableName, 'appId', false);
    }

    async getById(appId) {
        const app = await this.get(appId);
        if (!app) {
            throw Error(`app with appId: ${appId} does not exist`);
        }
        return app;
    }

    async findByIds(appIds) {
        appIds = Util.removeDuplicates(appIds);
        return this.batchGetMap(appIds, 'appId');
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

    async getByDomain(domain) {
        const app = await this.findByDomain(domain);
        if (!app) {
            throw Error(`app with domain: ${domain} does not exist`);
        }
        return app;
    }

    async save(appD) {
        try {
            const {
                newState,
                newState: {
                    appId,
                    domain,
                },
                oldState
            } = appD;
            const items = this._toTransactPutItems(newState);

            const appDomainQuery = {
                TableName: process.env.uniqueAppDomainAppTableName,
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
                        TableName: process.env.uniqueAppDomainAppTableName,
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
            await this.transactWrite(items);
        } catch (error) {
            console.error('Error saving app: ', error);
            if (error.code === 'TransactionCanceledException') {
                throw "Domain asociated to the app is already in use";
            }
            throw error;
        }
    }

}

export default AppDao;