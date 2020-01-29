import { PolicyUtil, RequestUtil } from './util';
import { AppDao, OauthDao, ScopeDao } from './dao';
import { ApiAccessRequest } from './domain';
import { OauthError } from './error'

const appDao = new AppDao();
const oauthDao = new OauthDao();
const scopeDao = new ScopeDao();
let scopes = null;

export async function main(event, context, callback) {

    const {
        headers,
        methodArn,
        body
    } = event;

    try {
        console.log('event: ', event);
        console.log('context: ', context);

        const accessToken = RequestUtil.parseBearerAuthHeader(headers);
        if (!accessToken) {
            throw new OauthError(OauthError.types.INVALID_REQUEST, 'No Authentication Header');
        }
        console.log('Access Token: ', accessToken);
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
        await apiAccessRequest.updateLastAccessAt();
        console.log('Access allowed', accessContext);
        callback(null, PolicyUtil.allow(accessContext.eosAccount, methodArn, accessContext));
    } catch (e) {
        console.error(e);
        if (e instanceof OauthError) {
            callback(null, PolicyUtil.deny('', methodArn, {
                wwwAuthenticate: `Bearer, error="${e.error}"`
            }));
        }
        callback('Unauthorized');
    }
}
