import AWS from 'aws-sdk';
import { AppDao } from '../dao';

class BaseAuthApi {

    constructor() {
        this.secretsmanager = new AWS.SecretsManager({ region: 'us-east-1' });
        this.appDao = new AppDao();
    }

    async getApp(event, body, mustExist = true) {
        throw 'Must be implemented by subclass';
    }

    async _getAppById(appId, mustExist = true) {
        return this.appDao.getById(appId, mustExist);
    }

    async authenticate(appId, appKey) {
        if (!appKey || !appId) {
            throw new Error('Access denied. appId and appKey are both required.');
        }
        const secret = await this.secretsmanager.getSecretValue({
            SecretId: appId,
        }).promise();
        var secretStringObj = JSON.parse(secret.SecretString);

        if (secretStringObj[appId] !== appKey) {
            throw new Error('Access denied. Invalid appId or appKey.');
        }
    }

    static isCognitoAuth(event) {
        return !!event.requestContext.identity.cognitoAuthenticationProvider;
    }

    async getUserName(event) {
        throw 'Must be implemented by subclass';
    }

}

export default BaseAuthApi;

