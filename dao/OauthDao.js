import { AppIds, ProfileFetchTypes } from "@smontero/ppp-common";
import BaseDao from "./BaseDao";
import { Util } from '../util';
import { ProfileAccessTypes } from '../const';
import { Profile } from '../domain';

class OauthDao extends BaseDao {
    constructor() {
        super(process.env.tokenTableName,
            {
                hashProp: 'authorizationCode',
                rangeProp: 'appId',
            },
            true);
    }

    async save(oauth) {
        await this.put(oauth);
    }



}

export default OauthDao;