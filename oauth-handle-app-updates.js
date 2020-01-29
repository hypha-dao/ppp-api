import { OauthDao } from "./dao";
import { Oauth } from './domain';

const oauthDao = new oauthDao();

export async function main(event, context, callback) {

    console.log('event: ', JSON.stringify(event, null, 2));
    console.log('context: ', JSON.stringify(context, null, 2));

    for (const record of event.Records) {

        if (record.eventName == 'MODIFY') {
            const {
                OldImage: oldApp,
                NewImage: newApp,
            } = record.dynamodb;

            console.log('Old app: ', JSON.stringify(oldApp, null, 2));
            console.log('New app: ', JSON.stringify(newApp, null, 2));
            const oauth = new Oauth(oauthDao);
            await oauth.onAppOauthStatusChange(oldApp, newApp);
        }
    }
    callback(null, `Successfully processed ${event.Records.length} records.`);

}
