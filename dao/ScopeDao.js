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
                "scope": "verify_eos_account",
                "name": "Verify EOS account",
                "desc": "Verify that you own the EOS account",
                "requiresVerifiedProfile": false,
                "resources": ["get-profile-oauth"]
            },
            {
                "scope": "profile_read",
                "name": "View Profile",
                "desc": "View your profile",
                "requiresVerifiedProfile": true,
                "resources": ["get-profile-oauth"],
            }
        ];
        await this.transactPut(scopes);
    }

    async getAllMappedByScope(valueProp = null) {
        return this.scanMap('scope', true, valueProp);
    }

    async getAllMappedByResources(valueProp = null) {
        return this.scanMap('resources', false, valueProp);
    }

    async getByIds(scopes) {
        scopes = Util.removeDuplicates(scopes);
        return this.batchGet(scopes);
    }
}

export default ScopeDao;