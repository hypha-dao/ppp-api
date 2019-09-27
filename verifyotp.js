import { ResponseUtil } from './util';
import { VerificationApi } from './service';
import { ContactDao } from './dao';
import { AuthApi } from "./service";

const authApi = new AuthApi();
const contactDao = new ContactDao();
const verificationApi = new VerificationApi(contactDao);

export async function sms(event, context) {
  const { appId, appKey, smsOtp } = JSON.parse(event.body);

  try {
    await authApi.authenticate(appId, appKey);
    if (!smsOtp) {
      return ResponseUtil.failure({ message: "smsOtp parameter is required" });
    }
    const eosAccount = await authApi.getUserName(event);
    await verificationApi.verifySmsOtp(appId, eosAccount, smsOtp)

    return ResponseUtil.success({
      message: `SMS Verify Code has been successfully validated: ${eosAccount}`
    });
  } catch (e) {
    return ResponseUtil.failure({ message: e.message });
  }
}


export async function email(event, context) {
  const { appId, appKey, emailOtp } = JSON.parse(event.body);

  try {
    await authApi.authenticate(appId, appKey);
    if (!emailOtp) {
      return ResponseUtil.failure({ message: "emailOtp parameters is required" });
    }
    const eosAccount = await authApi.getUserName(event);
    await verificationApi.verifyEmailOtp(appId, eosAccount, emailOtp)

    return ResponseUtil.success({
      message: `Email Verify Code has been successfully validated: ${eosAccount}`
    });
  } catch (e) {
    return ResponseUtil.failure({ message: e.message });
  }
}