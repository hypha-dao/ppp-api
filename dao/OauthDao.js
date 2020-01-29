import { OauthTokenStatus } from '@smontero/ppp-common';
import BaseDao from "./BaseDao";
import { OauthError } from '../error';

class OauthDao extends BaseDao {
    constructor() {
        super(process.env.oauthTableName,
            {
                hashProp: 'authorizationCode'
            },
            false);
    }

    async save(oauth) {
        const {
            appId,
            eosAccount,
        } = oauth;
        oauth.appEosAccount = this.appAttribute(appId, eosAccount);
        await this.put(oauth);
    }

    async findByAuthCode(authCode) {
        return this.get(authCode);
    }

    async getByAuthCode(authCode) {
        const oauth = await this.findByAuthCode(authCode);
        if (!oauth) {
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
        if (!oauth) {
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
        if (!oauth) {
            throw new OauthError(OauthError.types.INVALID_TOKEN, 'Refresh token not found');
        }
        return oauth;
    }

    async getValidByEosAccount(eosAccount) {
        const query = {
            IndexName: 'GSI_eosAccount_oauthTokenStatus',
            KeyConditionExpression: 'eosAccount = :eosAccount and oauthTokenStatus = :oauthTokenStatus',
            FilterExpression: 'refreshTokenExpiration > :currentTimestamp',
            ExpressionAttributeValues: {
                ':eosAccount': eosAccount,
                ':oauthTokenStatus': OauthTokenStatus.VALID,
                ':currentTimestamp': Date.now(),
            },
        };

        return this.queryAll(query);
    }

    async revokeByAppIdAndEosAccount(appId, eosAccount, status) {
        const appEosAccount = this.appAttribute(appId, eosAccount);
        const readParams = {
            IndexName: 'GSI_appEosAccount_oauthTokenStatus',
            KeyConditionExpression: 'appEosAccount = :appEosAccount and oauthTokenStatus = :oauthTokenStatus',
            ExpressionAttributeValues: {
                ':appEosAccount': appEosAccount,
                ':oauthTokenStatus': OauthTokenStatus.VALID,
            },
        };

        await this._revoke(readParams, status);
    }

    async revokeByAppId(appId, status) {
        const readParams = {
            IndexName: 'GSI_appId_oauthTokenStatus',
            KeyConditionExpression: 'appId = :appId and oauthTokenStatus = :oauthTokenStatus',
            ExpressionAttributeValues: {
                ':appId': appId,
                ':oauthTokenStatus': OauthTokenStatus.VALID,
            },
        };

        await this._revoke(readParams, status);
    }

    async _revoke(readParams, status) {

        await this.updateItems(readParams, (oauth) => {
            oauth.oauthTokenStatus = status;
            oauth.revokedAt = Date.now();
            return oauth;
        });
    }


}

export default OauthDao;