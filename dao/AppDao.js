import BaseDao from "./BaseDao";

class AppDao extends BaseDao {
    constructor() {
        super(process.env.appTableName, 'domain', false);
    }

    async getById(appId) {
        const app = await this.get(appId);
        if (!app) {
            throw Error(`app with appId: ${appId} does not exist`);
        }
        return app;
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

    async getByDomain(domain) {
        const app = await this.findByDomain(domain);
        if (!app) {
            throw Error(`app with domain: ${domain} does not exist`);
        }
        return app;
    }

}

export default AppDao;