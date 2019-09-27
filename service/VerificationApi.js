import { commApi } from "./";


class VerificationApi {

    constructor(contactDao) {
        this.contactDao = contactDao;
    }

    static async sendSmsOtp(smsNumber) {
        const smsotp = Math.floor(100000 + Math.random() * 900000)
        const msg = await commApi.sendSMS(smsNumber, `Your one time passcode is: ${smsotp}`);
        return smsotp;
    }

    static async sendEmailOtp(emailAddress) {
        const otp = Math.floor(100000 + Math.random() * 900000)
        const r = await commApi.sendEmail(emailAddress, `One Time Passode: ${otp}`, `Your one time passcode is: ${otp}`);
        return otp;
    }

    static updateEmail(contactRecord, newEmailAddress) {
        console.log(" updateEmail, contactRecord  : ", contactRecord);
        console.log(" updateEmail, newEmailAddress    : ", newEmailAddress);

        if (newEmailAddress && newEmailAddress != contactRecord.emailAddress) {
            contactRecord.emailVerified = 0;
            contactRecord.emailAddress = newEmailAddress;
            console.log(" new email: ", newEmailAddress);
            return true;
        }
        return false;
    }

    static updateSms(contactRecord, newSmsNumber) {
        console.log(" updateSms, contactRecord  : ", contactRecord);
        console.log(" updateSms, newSmsNumber    : ", newSmsNumber);

        if (newSmsNumber && newSmsNumber != contactRecord.smsNumber) {
            contactRecord.smsVerified = 0;
            contactRecord.smsNumber = newSmsNumber;
            console.log(" smsNumber    : ", newSmsNumber);
            return true;
        }
        return false;
    }

    async verifySmsOtp(appId, eosAccount, smsOtp) {
        const contactRecord = await this.contactDao.getByEOSAccount(appId, eosAccount);

        if (smsOtp !== contactRecord.smsOtp.toString()) {
            throw new Error(`Invalid SMS Verify Code: ${smsOtp}`);
        }
        contactRecord.smsVerified = Date.now();
        await this.contactDao.save(contactRecord);
    }

    async verifyEmailOtp(appId, eosAccount, emailOtp) {
        const contactRecord = await this.contactDao.getByEOSAccount(appId, eosAccount);

        if (emailOtp !== contactRecord.emailOtp.toString()) {
            throw new Error(`Invalid Email Verify Code: ${emailOtp}`);
        }
        contactRecord.emailVerified = Date.now();
        await this.contactDao.save(contactRecord);
    }

}

export default VerificationApi;
