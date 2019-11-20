import uuid from "uuid";
import assert from 'assert';

class App {

    constructor({
        appId,
        requesterAccount,
        type
    }, appDao) {
        console.log(`appId: ${appId}, requesterAccount: ${requesterAccount}, type: ${type}`);
        this.appId = appId;
        this.requesterAccount = requesterAccount;
        this.type = type;
        this.appDao = appDao;
    }

    async _loadStates(newDetails) {
        console.log('New Details: ', newDetails);
        let details = null;
        if (this.appId) {
            details = await this.appDao.getById(this.appId);
            this.oldState = details;
        } else {
            details = {
                appId: uuid.v1(),
            };
        }
        this.newState = {
            ...details,
            ownerAccount: this.requesterAccount,
            type: this.type,
            ...newDetails,
        };
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