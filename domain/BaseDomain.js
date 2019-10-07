import { Util } from '../util';

class BaseDomain {

    static requiresUpdate(entityName, oldEntity, newEntity, typeMode = false) {

        for (const fieldObj of this._getEntityFields(entityName)) {
            const { field } = fieldObj;
            console.log(`Checking if ${field} field changed...`);
            if (Util.getPath(oldEntity, field, null, typeMode) !== Util.getPath(newEntity, field, null, typeMode)) {
                return true;
            }
        }
        return false;
    }

    static _getEntityFields(entityName) {
        return this.ENTITY_FIELDS[entityName] || [];
    }

    static getEntityDetails(entityName, entity, typeMode = false) {
        const details = {};
        for (const fieldObj of this._getEntityFields(entityName)) {
            let { field, name } = fieldObj;
            name = name || field;
            details[name] = Util.getPath(entity, field, null, typeMode);
        }
        return details;
    }
}

export default BaseDomain;