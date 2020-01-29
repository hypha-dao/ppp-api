import { ProfileDao } from "./dao";
import { Profile } from './domain';

const profileDao = new ProfileDao();

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
            if (Profile.requiresUpdate('app', oldApp, newApp, true)) {
                console.log('Requires update, updating Profiles...')
                const appDetails = Profile.getEntityDetails('app', newApp, true);
                await profileDao.updateAppDetails(newApp.appId.S, appDetails);
            }
        }
    }
    callback(null, `Successfully processed ${event.Records.length} records.`);

}
