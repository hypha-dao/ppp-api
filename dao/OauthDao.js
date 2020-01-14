import BaseDao from "./BaseDao";
import { OauthError } from '../error';

class OauthDao extends BaseDao {
    constructor() {
        super(process.env.oauthTableName,
            {
                hashProp: 'authorizationCode',
                rangeProp: 'appId',
            },
            true);
    }

    async save(oauth) {
        await this.put(oauth);
    }

    async findByAuthCodeAndAppId(authCode) {
        return this.get(authCode);
    }

    async getByAuthCode(authCode) {
        const oauth = await this.findByAuthCodeAndAppId(authCode);
        if (oauth) {
            throw new OauthError(OauthError.types.INVALID_GRANT, 'Authorization code not found');
        }
        return oauth;
    }

    async findByAccessToken(accessToken) {
        return this.queryOne({
            IndexName: 'GSI_accessToken',
            KeyConditionExpression: 'accessToken = :accessToken',
            ExpressionAttributeValues: {
                ':accessToken': accessToken,
            },
        });
    }

    async getByAccessToken(accessToken) {
        const oauth = await this.findByAccessToken(accessToken);
        if (oauth) {
            throw new OauthError(OauthError.types.INVALID_TOKEN, 'Access token not found');
        }
        return oauth;
    }

    async findByRefreshToken(refreshToken) {
        return this.queryOne({
            IndexName: 'GSI_refreshToken',
            KeyConditionExpression: 'refreshToken = :refreshToken',
            ExpressionAttributeValues: {
                ':refreshToken': refreshToken,
            },
        });
    }

    async getByRefreshToken(refreshToken) {
        const oauth = await this.findByRefreshToken(refreshToken);
        if (oauth) {
            throw new OauthError(OauthError.types.INVALID_TOKEN, 'Refresh token not found');
        }
        return oauth;
    }


}

export default OauthDao;