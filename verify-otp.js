import { ResponseUtil } from './util';
import { ProfileDao } from './dao';
import { AuthApi } from "./service";

const authApi = new AuthApi();
const profileDao = new ProfileDao();

export async function sms(event, context) {
  const body = JSON.parse(event.body);
  const { smsOtp } = body;

  try {
    const { appId } = await authApi.getApp(event, body);
    if (!smsOtp) {
      return ResponseUtil.failure({ message: "smsOtp parameter is required" });
    }
    const eosAccount = await authApi.getUserName(event);
    const profile = await profileDao.getProfile(appId, eosAccount);
    profile.verifySmsOtp(smsOtp);
    await profileDao.save(profile.profile);

    return ResponseUtil.success({
      message: `SMS Verify Code has been successfully validated: ${eosAccount}`
    });
  } catch (e) {
    console.error(e);
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
    const profile = await profileDao.getProfile(appId, eosAccount);
    profile.verifyEmailOtp(emailOtp);
    await profileDao.save(profile.profile);

    return ResponseUtil.success({
      message: `Email Verify Code has been successfully validated: ${eosAccount}`
    });
  } catch (e) {
    console.error(e);
    return ResponseUtil.failure(e);
  }
}