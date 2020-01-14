import { OauthError } from '../error';

class OauthRequest {

  constructor(appDao, oauthDao) {
    this.appDao = appDao;
    this.oauthDao = oauthDao;
  }

  _loadApp(appId) {
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
}

export default OauthRequest;