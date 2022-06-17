import BaseDao from "./BaseDao";


const ExpressionAttributeNames = {
    '#d': 'domain',
};

class UniqueAppDomainDao extends BaseDao {
    constructor() {
        super(process.env.uniqueAppDomainTableName, 'domain', false);
    }

    async getByDomain(domain, mustExist = true) {
        const uniqueAppDomain = await this.get(domain);
        if (!uniqueAppDomain && mustExist) {
            throw Error(`uniqueAppDomain with domain: ${domain} does not exist`);
        }
        return uniqueAppDomain;
    }

}

export default UniqueAppDomainDao;