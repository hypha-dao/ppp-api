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
                desc: 'Allows apps to view your profile',
            }
        ];
        await this.transactPut(scopes);
    }

    async getAll() {
        const { items } = await this.scan();
        return items;
    }

    async getByIds(scopes) {
        scopes = Util.removeDuplicates(scopes);
        return this.batchGet(scopes);
    }
}

export default ScopeDao;