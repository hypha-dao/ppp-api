import { ChatDao } from "./dao";
import { Chat } from './domain';

const chatDao = new ChatDao();

export async function main(event, context, callback) {
    console.log('event: ', JSON.stringify(event, null, 2));
    console.log('context: ', JSON.stringify(context, null, 2));

    for (const record of event.Records) {

        if (record.eventName == 'MODIFY') {
            const {
                OldImage: oldProfile,
                NewImage: newProfile,
            } = record.dynamodb;

            console.log('Old profile: ', JSON.stringify(oldProfile, null, 2));
            console.log('New profile: ', JSON.stringify(newProfile, null, 2));
            if (Chat.requiresUpdate('profile', oldProfile, newProfile, true)) {
                console.log('Requires update, updating chats...')
                const counterPartyDetails = Chat.getEntityDetails('profile', newProfile, true);
                await chatDao.updateCounterPartyDetails(newProfile.eosAccount.S, counterPartyDetails);
            }
        }
    }
    callback(null, `Successfully processed ${event.Records.length} records.`);
}
