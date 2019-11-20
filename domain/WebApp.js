import axios from 'axios';
import App from './App';
import { AppTypes } from '@smontero/ppp-common';

class WebApp extends App {

    constructor({
        appId,
        baseUrl,
        requesterAccount,
    }, appDao) {
        super({
            appId,
            requesterAccount,
            type: AppTypes.WEB_APP,
        }, appDao)
        console.log(`baseUrl: ${baseUrl}`);
        if (!baseUrl) {
            throw 'baseUrl is a required parameter';
        }
        this.baseUrl = new URL(baseUrl);
        this.domain = this.baseUrl.hostname;
        this.chainId = process.env.chainId;
        this.ax = axios.create({
            baseURL: baseUrl
        });
        this.newState = null;
    }

    async _request(file, errorMsg) {
        try {
            const { data } = await this.ax.get(file);
            return data;
        } catch (error) {
            console.error(errorMsg, error);
            throw errorMsg;
        }
    }

    _findChainManifest(manifests) {
        for (const manifest of manifests) {
            if (manifest.chainId === this.chainId) {
                return manifest;
            }
        }
        return null;
    }

    async _getOwnerAccount() {
        const { manifests } = await this._request('chain-manifests.json', 'Error loading chain manifests');
        if (!manifests) {
            throw 'No chain manifests found';
        }
        let manifest = this._findChainManifest(manifests);
        if (!manifest) {
            throw `No manifest found for chainId: ${this.chainId}`;
        }
        manifest = manifest.manifest;
        console.log('Chain manifest found: ', JSON.stringify(manifest, null, 2));
        return manifest.account;
    }

    async _getMetadata() {
        const { name, shortname, icon } = await this._request('app-metadata.json', 'Error loading app metadata');
        if (!name || !shortname || !icon) {
            throw 'Invalid app metadata, name, shortname or icon fields missing';
        }
        return {
            name,
            shortname,
            icon: this._getIconUrl(icon),
        };
    }

    _getIconUrl(icon) {
        try {
            const iconUrl = new URL(icon, this.baseUrl.href);
            return iconUrl.href;
        } catch (error) {
            console.error(error);
            throw 'Invalid app icon url';
        }
    }

    async loadDetails() {
        const ownerAccount = await this._getOwnerAccount();
        if (ownerAccount !== this.requesterAccount) {
            throw `Domain owner account: ${ownerAccount} does not match requester account: ${this.requesterAccount}`;
        }
        const metadata = await this._getMetadata();
        await this._loadStates({
            domain: this.domain,
            ...metadata,
        });

        if (!this.isNewApp() && this.oldState.ownerAccount !== this.requesterAccount && this.oldState.domain !== this.domain) {
            throw `Owner account: ${ownerAccount} does not match requester account: ${this.requesterAccount}`;
        }
    }

    isNewDomain() {
        this.assertState();
        return !this.oldState || (this.oldState.domain != this.newState.domain);
    }

}

export default WebApp;