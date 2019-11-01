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

}

export default VerificationApi;
