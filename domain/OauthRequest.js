import { OauthAppStatus, OauthTokenStatus } from '@hypha-dao/ppp-common';
import { OauthError } from '../error';
import { TimeUtil } from '../util';

class OauthRequest {

  constructor(appDao, oauthDao) {
    this.appDao = appDao;
    this.oauthDao = oauthDao;
  }

  async _loadApp(appId) {
    this.app = await this.appDao.getById(appId, false);
    if (!this.app) {
      throw new OauthError(OauthError.types.UNAUTHORIZED_CLIENT, 'Client app does not exist');
    }
  }

  _assertOuathTokenStatus(status, error) {
    if (!OauthTokenStatus.isValid(status)) {
      throw new OauthError(error, `Token is no longer valid:${status}`);
    }
  }

  _assertOuathAppStatus(status, error) {
    if (!OauthAppStatus.isEnabled(status)) {
      throw new OauthError(error, `App has been disabled:${status}`);
    }
  }

  _redirectUrls() {
    return this.app.oauthRedirectUrls;
  }

  _hasRegisteredUrls() {
    const redirectUrls = this._redirectUrls();
    return redirectUrls && redirectUrls.length;
  }

  getExpirationTime(minutes) {
    return TimeUtil.addMinutes(minutes).getTime();
  }

  hasExpired(expiration) {
    return expiration <= Date.now();
  }

}

export default OauthRequest;