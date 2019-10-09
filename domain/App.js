import axios from 'axios';
import uuid from "uuid";
import assert from 'assert';

class App {

    constructor({
        appId,
        baseUrl,
        requesterAccount,
    }, appDao) {
        console.log(`appId: ${appId}, baseUrl: ${baseUrl}, requesterAccount: ${requesterAccount}`);
        this.appId = appId;
        this.baseUrl = new URL(baseUrl);
        this.domain = this.baseUrl.hostname;
        this.requesterAccount = requesterAccount;
        this.chainId = process.env.chainId;
        this.appDao = appDao;
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
        const { manifest } = this._findChainManifest(manifests);
        if (!manifest) {
            return `No manifest found for chainId: ${this.chainId}`;
        }
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
            icon
        };
    }

    async loadDetails() {
        const ownerAccount = await this._getOwnerAccount();
        if (ownerAccount !== this.requesterAccount) {
            throw `Domain owner account: ${ownerAccount} does not match requester account: ${this.requesterAccount}`;
        }
        let details = null;
        if (this.appId) {
            details = await this.appDao.getById(this.appId);
            const { ownerAccount, domain } = details;
            if (this.requesterAccount !== ownerAccount && this.domain !== domain) {
                throw `It's not possible to update the owner account and domain at the same time`;
            }
            this.oldState = details;
        } else {
            details = {
                appId: uuid.v1(),
            };
        }
        const metadata = await this._getMetadata();
        details = {
            ...details,
            domain: this.domain,
            ownerAccount: this.requesterAccount,
            ...metadata,
        };
        this.newState = details;
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