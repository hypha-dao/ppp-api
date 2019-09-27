import { ResponseUtil } from './util';
import { ContactDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const contactDao = new ContactDao();

export async function main(event, context) {
    try {

        console.log('event: ', event);
        console.log('context: ', context);
        const { appId, appKey } = JSON.parse(event.body);
        await authApi.authenticate(appId, appKey);
        const eosAccount = await authApi.getUserName(event);
        const contact = await contactDao.findByEOSAccount(appId, eosAccount, true);
        console.log(" Contact Record: ", contact)
        return ResponseUtil.success({
            status: true,
            contact,
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
