import { ResponseUtil } from './util';
import { ContactDao } from "./dao";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const contactDao = new ContactDao();

export async function main(event, context) {
    try {
        const {
            appId,
            appKey,
            limit,
            lastEvaluatedKey,
            search,
        } = JSON.parse(event.body);

        await authApi.authenticate(appId, appKey);

        let contacts = await contactDao.search({
            appId,
            search,
            limit,
            lastEvaluatedKey
        });
        let items = [];
        for (const contact of contacts.items) {
            console.log(contact);
            const {
                eosAccount,
                appData,
            } = contact;
            items.push({
                eosAccount,
                ...appData,
            });
        }
        contacts.items = items;
        return ResponseUtil.success({
            status: true,
            contacts,
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
