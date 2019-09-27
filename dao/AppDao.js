import BaseDao from "./BaseDao";

class AppDao extends BaseDao {
    constructor() {
        super(process.env.appsTableName, 'appId', false);
    }

    async getById(appId) {
        const app = await this.get(appId);
        if (!app) {
            throw Error(`app with Id: ${appId} does not exist`);
        }
        return app;
    }

}

export default AppDao;