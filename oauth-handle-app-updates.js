import { OauthDao } from "./dao";
import { Oauth } from './domain';

const oauthDao = new OauthDao();

export async function main(event, context, callback) {

    console.log('event: ', JSON.stringify(event, null, 2));
    console.log('context: ', JSON.stringify(context, null, 2));

    for (const record of event.Records) {
        const {
            eventName,
            dynamodb,
        } = record;
        if (eventName == 'MODIFY') {
            const {
                OldImage: oldApp,
                NewImage: newApp,
            } = dynamodb;

            console.log('Old app: ', JSON.stringify(oldApp, null, 2));
            console.log('New app: ', JSON.stringify(newApp, null, 2));
            const oauth = new Oauth(oauthDao);
            await oauth.onAppChange(oldApp, newApp);
        }

        if (eventName == 'REMOVE') {
            const {
                OldImage: oldApp,
            } = dynamodb;

            console.log('Old app: ', JSON.stringify(oldApp, null, 2));
            const oauth = new Oauth(oauthDao);
            await oauth.onAppDelete(oldApp);
        }
    }
    callback(null, `Successfully processed ${event.Records.length} records.`);

}
