import AWS from 'aws-sdk';
import BaseAuthApi from './BaseAuthApi';

class CognitoAuthApi extends BaseAuthApi {

    static isThisAuth(event) {
        return event.requestContext.identity && event.requestContext.identity.cognitoAuthenticationProvider;
    }

    constructor() {
        super();
        this.cognitoClient = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
    }

    /* async getApp(event, body, mustExist = true) {
        return this.appDao.getByDomain('app-dev.telos.net', mustExist);
    } */

    async getApp(event, body, mustExist = true) {

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
            app = await this._getAppById(originAppId, mustExist);
        } else {
            const url = new URL(origin);
            app = await this.appDao.getByDomain(url.hostname, mustExist);
        }
        return app;
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
        return "app.tf";
    } */
}

export default CognitoAuthApi;

