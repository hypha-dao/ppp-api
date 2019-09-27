import { ResponseUtil } from './util';
import { ContactDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const contactDao = new ContactDao();

export async function main(event, context) {

    try {
        let { appId, appKey, eosAccounts } = JSON.parse(event.body);
        await authApi.authenticate(appId, appKey);
        if (!eosAccounts) {
            return ResponseUtil.failure("eosAccounts parameter is required");
        }
        const appData = await contactDao.findByEOSAccounts(appId, eosAccounts);
        console.log(' appData: ', appData)

        return ResponseUtil.success({ status: true, appData });
    } catch (e) {
        return ResponseUtil.failure(e.message);
    }
}
