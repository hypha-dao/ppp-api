import BaseDomain from './BaseDomain';
import { PublicFields } from '@smontero/ppp-common';


class Chat extends BaseDomain {

    constructor(chat, sender, receiver, isSender) {
        super();
        if (sender) { //asume we are building a new chat
            let party;
            let counterParty;
            if (isSender) {
                party = sender;
                counterParty = receiver;
            } else {
                party = receiver;
                counterParty = sender;
            }
            chat = this._build(chat, party, counterParty, isSender);
        }
        this.chat = chat;
    }

    _build(
        {
            appId,
            sentAt,
            subject,
            message,
        },
        party,
        counterParty,
        isSender) {

        return {
            appId,
            sentAt,
            subject,
            message,
            eosAccount: party.eosAccount,
            ...this._counterPartyDetails(counterParty),
            isSender
        }
    }

    _counterPartyDetails(cp) {
        return {
            counterPartyAccount: cp.eosAccount,
            counterParty: Chat.getEntityDetails('profile', cp),
        };
    }
}

Chat.ENTITY_FIELDS = {
    profile: [
        {
            field: `publicData.${PublicFields.FIRST_NAME}`,
            name: PublicFields.FIRST_NAME,
        },
        {
            field: `publicData.${PublicFields.LAST_NAME}`,
            name: PublicFields.LAST_NAME,
        },
        {
            field: `publicData.${PublicFields.S3_IDENTITY}`,
            name: PublicFields.S3_IDENTITY,
        },
        {
            field: `publicData.${PublicFields.PROFILE_IMAGE}`,
            name: PublicFields.PROFILE_IMAGE
        },
    ],
};

export default Chat;