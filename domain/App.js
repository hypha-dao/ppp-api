import { OauthAppStatus } from '@hypha-dao/ppp-common';
import { AccessTypes } from '../const';
import { Util, ValidationUtil } from "../util";
import assert from 'assert';

class App {

    constructor(appDao) {
        this.appDao = appDao;
    }

    async register({
        appId,
        requesterAccount,
        type,
        isPrivate,
        oauthRedirectUrls,
    }) {
        console.log(`appId: ${appId}, requesterAccount: ${requesterAccount}, type: ${type}`);
        this.oldState = null;
        this.newState = null;
        this.appId = appId;
        this.requesterAccount = requesterAccount;
        this.type = type;
        this.isPrivate = isPrivate;
        this.oauthRedirectUrls = oauthRedirectUrls;
        this._validateInputs();
        this._finishSetup();
        await this._loadDetails();
        await this.save();
    }

    async updateOauthStatus(appId, requesterAccount, status) {
        const app = await this._getApp(appId);
        const {
            ownerAccount,
            oauthAppStatus,
        } = app;
        this._assertIsOwner(ownerAccount, requesterAccount);
        if (oauthAppStatus === OauthAppStatus.DISABLED_BY_SERVER) {
            throw 'Cannot update oauth status when it has been disabled by server';
        }
        app.oauthAppStatus = status;
        app.oauthStatusChangedAt = Date.now();
        await this.appDao.updateOauthStatus(app);

    }

    _assertIsOwner(ownerAccount, requesterAccount) {
        if (ownerAccount !== requesterAccount) {
            throw `Owner account: ${ownerAccount} does not match requester account: ${requesterAccount}`;
        }
    }

    _validateInputs() {
        if (!this.type) {
            throw 'type is a required parameter';
        }
        if (this.isPrivate == null) {
            throw 'isPrivate is a required parameter';
        }
        if (this.oauthRedirectUrls) {
            if (!Array.isArray(this.oauthRedirectUrls)) {
                throw 'oauthRedirectUrls must be an array of urls';
            }
            for (const url of this.oauthRedirectUrls) {
                if (!ValidationUtil.isValidUrl(url, ['http'])) {
                    throw 'oauthRedirectUrls must contain valid urls';
                }
            }
        }
    }

    _finishSetup() { }
    async _loadDetails() { }

    async _getApp(appId) {
        return this.appDao.getById(appId);
    }

    async _loadStates(newDetails) {
        console.log('New Details: ', newDetails);
        let details = null;
        if (this.appId) {
            details = await this._getApp(this.appId);
            this.oldState = details;
        } else {
            details = {
                appId: Util.uuid(),
                oauthAppStatus: OauthAppStatus.ENABLED,
            };
        }

        this.newState = {
            ...details,
            ownerAccount: this.requesterAccount,
            type: this.type,
            isPrivate: this.isPrivate,
            oauthRedirectUrls: this.oauthRedirectUrls,
            ...newDetails,
        };

        if (this._isPrivateChanged()) {
            if (this.isPrivate) {
                this.newState.secret = Util.randomString();
            } else {
                delete this.newState.secret;
            }
        }
    }

    _isPrivateChanged() {
        return !this.oldState || this.oldState.isPrivate != this.isPrivate;
    }

    assertState() {
        assert(this.newState, '_loadStates method should be called first!');
    }

    isNewApp() {
        this.assertState();
        return !this.oldState;
    }

    assertState() {
        assert(this.newState, 'loadDetails method should be called first!');
    }

    isNewDomain() {
        this.assertState();
        return !this.oldState || (this.oldState.domain != this.newState.domain);
    }

    isNewApp() {
        this.assertState();
        return !this.oldState;
    }

    async save() {
        this.assertState();
        await this.appDao.save(this);
    }

    static restrictAccess(app, accessType = AccessTypes.PUBLIC) {
        if (accessType === AccessTypes.ADMIN || accessType === AccessTypes.OWNER) {
            return app;
        }

        const {
            appId,
            icon,
            name,
            shortname,
            url,
            type,
        } = app;

        return {
            appId,
            icon,
            name,
            shortname,
            url,
            type,
        };
    }

}

export default App;