import BaseDao from "./BaseDao";
import { Util } from "../util";

class ScopeDao extends BaseDao {
    constructor() {
        super(process.env.scopeTableName,
            {
                hashProp: 'scope'
            },
            true);
    }

    async insertScopes() {
        const scopes = [
            {
                scope: 'profile_read',
                name: 'View Profile',
                desc: 'App will be able to view your profile',
                resources: ['get-profile-oauth']
            }
        ];
        await this.transactPut(scopes);
    }

    async getAllMappedByScope() {
        return this.scanMap('scope');
    }

    async getAllMappedByResources() {
        return this.scanMap('resources');
    }

    async getByIds(scopes) {
        scopes = Util.removeDuplicates(scopes);
        return this.batchGet(scopes);
    }
}

export default ScopeDao;