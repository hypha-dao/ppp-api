
class RequestUtil {

    static parseAuthorizationHeader(headers) {
        const { Authorization: auth } = headers;
        if (!auth) {
            return null;
        }
        var encodedCreds = auth.split(' ')[1]
        var plainCreds = Buffer.from(encodedCreds, 'base64').toString().split(':')
        return {
            username: plainCreds[0],
            password: plainCreds[1],
        };
    }

    static parseMethodArn(methodArn) {
        const methodArnComponents = methodArn.split(':');
        const apiGatewayArnTmp = methodArnComponents[5].split('/');
        let resource = '/'; // root resource
        if (apiGatewayArnTmp[3]) {
            resource += apiGatewayArnTmp[3];
        }

        return {
            awsAccountId: methodArnComponents[4],
            region: methodArnComponents[3],
            restApiId: apiGatewayArnTmp[0],
            stage: apiGatewayArnTmp[1],
            method: apiGatewayArnTmp[2],
            resource,
        };
    }
    /**
     * 
     * @param {string} resource 
     */
    static stripResource(resource) {
        if (resource.charAt(0) === '/') {
            resource = resource.substring(1);
        }
        return resource;
    }
}

export default RequestUtil;


