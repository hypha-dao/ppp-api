
class PolicyUtil {

    static generatePolicy(principalId, effect, resource, context) {
        var authResponse = {};

        authResponse.principalId = principalId;
        if (effect && resource) {
            var policyDocument = {};
            policyDocument.Version = '2012-10-17';
            policyDocument.Statement = [];
            var statementOne = {};
            statementOne.Action = 'execute-api:Invoke';
            statementOne.Effect = effect;
            statementOne.Resource = resource;
            policyDocument.Statement[0] = statementOne;
            authResponse.policyDocument = policyDocument;
        }
        if (context) {
            authResponse.context = context;
        }
        return authResponse;
    }

    static allow(principalId, resource, context) {
        return this.generatePolicy(principalId, 'Allow', resource, context);
    }

    static deny(principalId, resource, context) {
        return this.generatePolicy(principalId, 'Deny', resource, context);
    }
}

export default PolicyUtil;


