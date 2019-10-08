import axios from 'axios';
import { AppDao } from '../dao';


class App {

    constructor({
        appId,
        baseUrl,
        requesterAccount,
    }) {
        this.appId = appId;
        this.baseUrl = new URL(baseUrl);
        this.requesterAccount = requesterAccount;
        this.chainId = process.env.chainId;
        this.appDao = new AppDao();
        this.ax = axios.create({
            baseURL
        });
    }

    async _request(file, errorMsg) {
        try {
            return axios.get(file);
        } catch (error) {
            console.log(errorMsg, error);
            throw errorMsg;
        }
    }

    _findChainManifest(manifests) {
        for (let manifest of manifests) {
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
        const manifest = this._findChainManifest(manifests);
        if (!manifest) {
            return `No manifest found for chainId: ${this.chainId}`;
        }
        return manifest.account;
    }

    async _loadMetadata() {
        return axios.get(this.appMeta);
    }

    async loadDetails() {
        const ownerAccount = this._getOwnerAccount();
        if (ownerAccount !== this.requesterAccount) {
            throw `Domain owner account: ${ownerAccount} does not match requester account: ${this.requesterAccount}`;
        }
        if (appId) {
            this.appDao.getById();
        }

    }

}

export default App;