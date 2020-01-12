import { Util, ValidationUtil } from "../util";
import assert from 'assert';

class App {

    constructor({
        appId,
        requesterAccount,
        type,
        isPrivate,
        oauthRedirectUrls,
    }, appDao) {
        console.log(`appId: ${appId}, requesterAccount: ${requesterAccount}, type: ${type}`);
        this.oldState = null;
        this.newState = null;
        this.appId = appId;
        this.requesterAccount = requesterAccount;
        this.type = type;
        this.isPrivate = isPrivate;
        this.oauthRedirectUrls = oauthRedirectUrls;
        this.appDao = appDao;

    }

    _validateInputs() {
        if (!this.type) {
            throw 'type is a required parameter';
        }
        if (!this.isPrivate == null) {
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

    async init() {
        this._validateInputs();
        this._finishSetup();
        await this._loadDetails();
    }

    async _loadStates(newDetails) {
        console.log('New Details: ', newDetails);
        let details = null;
        if (this.appId) {
            details = await this.appDao.getById(this.appId);
            this.oldState = details;
        } else {
            details = {
                appId: Util.uuid(),
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

}

export default App;