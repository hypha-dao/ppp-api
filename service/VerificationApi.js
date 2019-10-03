import { commApi } from "./";


class VerificationApi {

    constructor(profileDao) {
        this.profileDao = profileDao;
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

    static updateEmail(profile, newEmailAddress) {
        console.log(" updateEmail, profile  : ", profile);
        console.log(" updateEmail, newEmailAddress    : ", newEmailAddress);

        if (newEmailAddress && newEmailAddress != profile.emailAddress) {
            profile.emailVerified = 0;
            profile.emailAddress = newEmailAddress;
            console.log(" new email: ", newEmailAddress);
            return true;
        }
        return false;
    }

    static updateSms(profile, newSmsNumber) {
        console.log(" updateSms, profile  : ", profile);
        console.log(" updateSms, newSmsNumber    : ", newSmsNumber);

        if (newSmsNumber && newSmsNumber != profile.smsNumber) {
            profile.smsVerified = 0;
            profile.smsNumber = newSmsNumber;
            console.log(" smsNumber    : ", newSmsNumber);
            return true;
        }
        return false;
    }

    async verifySmsOtp(appId, eosAccount, smsOtp) {
        const profile = await this.profileDao.getByEOSAccount(appId, eosAccount);

        if (smsOtp != profile.smsOtp.toString()) {
            throw new Error(`Invalid SMS Verify Code: ${smsOtp}`);
        }
        profile.smsVerified = Date.now();
        await this.profileDao.save(profile);
    }

    async verifyEmailOtp(appId, eosAccount, emailOtp) {
        const profile = await this.profileDao.getByEOSAccount(appId, eosAccount);

        if (emailOtp != profile.emailOtp.toString()) {
            throw new Error(`Invalid Email Verify Code: ${emailOtp}`);
        }
        profile.emailVerified = Date.now();
        await this.profileDao.save(profile);
    }

}

export default VerificationApi;
