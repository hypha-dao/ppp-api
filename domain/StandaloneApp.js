import App from './App';
import { AppTypes } from '@smontero/ppp-common';

class StandaloneApp extends App {

    constructor({
        appId,
        name,
        shortname,
        icon,
        requesterAccount,
    }, appDao) {
        super({
            appId,
            requesterAccount,
            type: AppTypes.STANDALONE_APP,
        }, appDao)
        console.log(`name: ${name}, shortname: ${shortname}, icon: ${icon}`);
        this.name = name;
        this.shortname = shortname;
        this.icon = icon;
        this._validate();
    }

    _validate() {
        if (!this.name || !this.shortname || !this.icon) {
            throw 'name, shortname and icon parameters are required';
        }
    }

    async loadDetails() {
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

export default StandaloneApp;