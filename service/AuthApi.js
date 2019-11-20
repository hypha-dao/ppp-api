import AWS from 'aws-sdk';
import { AppDao } from '../dao';

class AuthApi {

    constructor() {
        this.cognitoClient = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
        this.secretsmanager = new AWS.SecretsManager({ region: 'us-east-1' });
        this.appDao = new AppDao();
    }

    async getApp(event, body, mustExist = true) {
        return this.appDao.getByDomain('app-dev.telos.net', mustExist);
    }

    /* async getApp(event, body, mustExist = true) {

        let app = null;
        let { originAppId } = body;
        const { headers } = event;
        const origin = headers ? headers.origin : null;
        if (!origin && !originAppId) {
            if (mustExist) {
                throw 'originAppId parameter is required for standalone apps';
            } else {
                return null;
            }
        }
        if (originAppId) {
            app = await this.appDao.getById(originAppId, mustExist);
        } else {
            const url = new URL(origin);
            app = await this.appDao.getByDomain(url.hostname, mustExist);
        }
        return app;
    } */

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

    isCognitoAuth(event) {
        return !!event.requestContext.identity.cognitoAuthenticationProvider;
    }

    async getUserName(event) {
        const {
            cognitoAuthenticationProvider,
        } = event.requestContext.identity;
        const userIdentifier = cognitoAuthenticationProvider.split('/').pop();
        const [userPoolId, userSub] = userIdentifier.split(':CognitoSignIn:');
        console.log(`Getting userName for user pool id: ${userPoolId} userSub: ${userSub}`);
        const { Users: [user] } = await this.cognitoClient.listUsers({
            UserPoolId: userPoolId,
            Filter: `sub = "${userSub}"`,
            Limit: 1
        }).promise();
        console.log("user:", user);
        return user.Username;
    }

    /* async getUserName(event) {
        return "sebastianmb1";
    } */
}

export default AuthApi;

