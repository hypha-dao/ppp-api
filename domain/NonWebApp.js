import App from './App';
import { AppTypes } from '@smontero/ppp-common';

class NonWebApp extends App {

    constructor({
        appId,
        name,
        shortname,
        icon,
        requesterAccount,
        isPrivate,
        oauthRedirectUrls,
    }, appDao) {
        super({
            appId,
            requesterAccount,
            type: AppTypes.NON_WEB_APP,
            isPrivate,
            oauthRedirectUrls,
        }, appDao)
        console.log(`name: ${name}, shortname: ${shortname}, icon: ${icon}`);
        this.name = name;
        this.shortname = shortname;
        this.icon = icon;
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
        if (!this.isNewApp() && this.oldState.ownerAccount !== this.requesterAccount) {
            throw `Owner account: ${ownerAccount} does not match requester account: ${this.requesterAccount}`;
        }
    }

}

export default NonWebApp;