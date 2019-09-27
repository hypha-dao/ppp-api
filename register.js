import merge from 'merge';
import { ResponseUtil } from './util';
import { ContactDao } from "./dao";
import { VerificationApi } from "./service";
import { AuthApi } from "./service";

const authApi = new AuthApi();
const contactDao = new ContactDao();

export async function main(event, context) {
    let {
        smsNumber,
        emailAddress,
        appData,
        appId,
        appKey,
        commPref,
    } = JSON.parse(event.body);

    try {
        await authApi.authenticate(appId, appKey);
        if (!(smsNumber || emailAddress || commPref || appData)) {
            return ResponseUtil.failure("Either smsNumber or emailAddress or commPref or appData are required");
        }
        const eosAccount = await authApi.getUserName(event);

        let contactRecord = await contactDao.getOrCreate(appId, eosAccount);
        console.log(" Contact Record from getOrCreateByEOSAccount: ", contactRecord);
        const emailChanged = VerificationApi.updateEmail(contactRecord, emailAddress);
        const smsChanged = VerificationApi.updateSms(contactRecord, smsNumber);

        if (commPref) contactRecord.commPref = commPref;

        ({ emailAddress, smsNumber, commPref } = contactRecord);

        if (!emailAddress && !smsNumber) {
            return ResponseUtil.failure("smsNumber or emailAddress is required for a new user");
        }

        if (commPref == 'EMAIL' && !emailAddress) {
            return ResponseUtil.failure("emailAddress is required if commPref is set to EMAIL");
        } else if (commPref == 'SMS' && !smsNumber) {
            return ResponseUtil.failure("smsNumber is required if commPref is set to SMS");
        }
        console.log(`Email Changed: ${emailChanged} Sms Changed: ${smsChanged}`);
        emailChanged && (contactRecord.emailOtp = await VerificationApi.sendEmailOtp(emailAddress));
        smsChanged && (contactRecord.smsOtp = await VerificationApi.sendSmsOtp(smsNumber));

        if (appData) contactRecord.appData = merge.recursive(true, contactRecord.appData, appData);

        console.log(" Contact Record before saveContact  : ", contactRecord)

        await contactDao.save(contactRecord);
        return ResponseUtil.success({
            status: true,
            message: `Contact record saved successfully`,
            contact: contactDao.toClientFormat(contactRecord),
        });
    } catch (e) {
        console.log(" ERROR  : ", e)
        return ResponseUtil.failure(e.message);
    }
}
