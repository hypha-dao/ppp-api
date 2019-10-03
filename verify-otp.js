import { ResponseUtil } from './util';
import { VerificationApi } from './service';
import { ProfileDao } from './dao';
import { AuthApi } from "./service";

const authApi = new AuthApi();
const profileDao = new ProfileDao();
const verificationApi = new VerificationApi(profileDao);

export async function sms(event, context) {
  const body = JSON.parse(event.body);
  const { smsOtp } = body;

  try {
    const { appId } = await authApi.getApp(event, body);
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
  const body = JSON.parse(event.body);
  const { emailOtp } = body;

  try {
    const { appId } = await authApi.getApp(event, body);
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