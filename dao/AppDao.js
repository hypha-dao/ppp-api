import BaseDao from "./BaseDao";
import { Util } from "../util";

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
            ExpressionAttributeNames: {
                '#d': 'domain',
            },
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

    async save(app) {
        const queryOpts = this.notExistsCondition({
            ExpressionAttributeNames: {
                '#d': 'domain',
            }
        }, '#d');
        await this.put(app, queryOpts);
    }

}

export default AppDao;