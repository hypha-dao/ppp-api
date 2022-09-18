import App from './App';
import { AppTypes } from '@hypha-dao/ppp-common';

class NonWebApp extends App {

    async register({
        appId,
        name,
        shortname,
        icon,
        requesterAccount,
        isPrivate,
        oauthRedirectUrls,
    }) {
        console.log(`name: ${name}, shortname: ${shortname}, icon: ${icon}`);
        this.name = name;
        this.shortname = shortname;
        this.icon = icon;
        await super.register({
            appId,
            requesterAccount,
            type: AppTypes.NON_WEB_APP,
            isPrivate,
            oauthRedirectUrls,
        });

    }

    _validateInputs() {
        super._validateInputs();
        if (!this.name || !this.shortname || !this.icon) {
            throw 'name, shortname and icon parameters are required';
        }
    }

    async _loadDetails() {
        await this._loadStates({
            name: this.name,
            shortname: this.shortname,
            icon: this.icon,
        });
        if (!this.isNewApp()) {
            this._assertIsOwner(this.oldState.ownerAccount, this.requesterAccount);
        }
    }

}

export default NonWebApp;