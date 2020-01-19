import { PolicyUtil, RequestUtil } from './util';
import { AppDao, OauthDao, ScopeDao } from './dao';
import { ApiAccessRequest } from './domain';
import { OauthError } from './error'

const appDao = new AppDao();
const oauthDao = new OauthDao();
const scopeDao = new ScopeDao();
let scopes = null;

export async function main(event, context, callback) {

    try {
        console.log('event: ', event);
        console.log('context: ', context);
        const {
            headers,
            methodArn,
            body
        } = event;
        const credentials = RequestUtil.parseAuthorizationHeader(headers);
        console.log('Credentials: ', credentials);
        if (!credentials) {
            throw new OauthError(OauthError.types.INVALID_REQUEST, 'Authentication ');
        }
        const { password: accessToken } = credentials;
        const resource = RequestUtil.stripResource(event.resource);
        console.log('Resource: ', resource);
        let payload = null;
        if (body) {
            payload = JSON.parse(body);
        }
        if (!scopes) {
            scopes = await scopeDao.getAllMappedByResources();
        }

        const apiAccessRequest = new ApiAccessRequest(appDao, oauthDao, scopes);
        console.log('Verifying access...');
        const accessContext = await apiAccessRequest.verifyAccess({
            accessToken,
            resource,
            payload
        });
        console.log('Access allowed', accessContext);
        callback(null, PolicyUtil.allow(accessContext.eosAccount, methodArn, accessContext));
    } catch (e) {
        console.error(e);
        if (e instanceof OauthError) {
            callback('Unauthorized', { context: e.payload() });
        }
        callback('Unauthorized');
    }
}
