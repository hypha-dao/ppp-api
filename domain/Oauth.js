import { OauthAppStatus, OauthTokenStatus } from '@hypha-dao/ppp-common';
import { Util } from '../util';

class Oauth {
  constructor(oauthDao, appDao) {
    this.oauthDao = oauthDao;
    this.appDao = appDao;
  }

  async getAuthorizedApps(eosAccount, scopesDomain) {
    const oauths = await this.oauthDao.getValidByEosAccount(eosAccount);
    const authorizations = {};

    for (const oauth of oauths) {
      const {
        appId,
        scopes,
        createdAt
      } = oauth;
      if (authorizations[appId]) {
        const auth = authorizations[appId];
        auth.scopes = new Set([...auth.scopes, ...scopes]);
        auth.since = Math.min(auth.since, createdAt);
      } else {
        authorizations[appId] = {
          scopes: new Set(scopes),
          since: createdAt,
        }
      }
    }
    const apps = await this.appDao.findBasicByIds(Object.keys(authorizations));
    for (const appId in apps) {
      authorizations[appId].app = apps[appId];
    }
    console.log('authorizations:', authorizations);
    let validAuthorizations = this._keepValid(Object.values(authorizations));
    await this._resolveScopes(validAuthorizations, scopesDomain);
    return validAuthorizations;
  }

  async _resolveScopes(authorizations, scopesDomain) {
    for (const auth of authorizations) {
      auth.scopes = await scopesDomain.find(auth.scopes);
    }
  }

  _keepValid(authorizations) {
    const valid = [];
    for (const auth of authorizations) {
      if (OauthAppStatus.isEnabled(auth.app.oauthAppStatus)) {
        valid.push(auth);
      }
    }
    return valid;
  }

  async onAppChange(oldApp, newApp) {
    const oldStatus = Util.getPath(oldApp, 'oauthAppStatus', null, true);
    const newStatus = Util.getPath(newApp, 'oauthAppStatus', null, true);
    if (oldStatus != newStatus && newStatus !== OauthAppStatus.ENABLED) {
      const appId = Util.getPath(newApp, 'appId', null, true);
      await this.oauthDao.revokeByAppId(appId, newStatus === OauthAppStatus.DISABLED_BY_APP ? OauthTokenStatus.REVOKED_BY_APP : OauthTokenStatus.REVOKED_BY_SERVER);
    }
  }

  async onAppDelete(oldApp) {
    const appId = Util.getPath(oldApp, 'appId', null, true);
    await this.oauthDao.revokeByAppId(appId, OauthTokenStatus.APP_DELETED);
  }
}

export default Oauth;