import AWS from 'aws-sdk';
import BaseCognitoAuthApi from './BaseCognitoAuthApi';

class CognitoAuthApi extends BaseCognitoAuthApi {

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

