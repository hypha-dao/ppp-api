import { OauthError } from '../error';
import { TimeUtil, Util } from '../util';

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