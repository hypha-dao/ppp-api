const AWS = require('aws-sdk');

class AuthApi {

    constructor() {
        this.cognitoClient = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
        this.secretsmanager = new AWS.SecretsManager({ region: 'us-east-1' });
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

    /*  async getUserName(event) {
         return "sebastianm21";
     } */
}

export default AuthApi;

