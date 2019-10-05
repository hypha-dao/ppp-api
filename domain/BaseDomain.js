import { Util } from '../util';

class BaseDomain {

    static requiresUpdate(entityName, oldEntity, newEntity) {

        for (const field of this._getEntityFields(entityName)) {
            if (Util.getPath(oldEntity, field.field) !== Util.getPath(newEntity, field.field)) {
                return true;
            }
        }
        return false;
    }

    static _getEntityFields(entityName) {
        return this.ENTITY_FIELDS[entityName] || [];
    }

    static getEntityDetails(entityName, entity) {
        const details = {};
        for (const fieldObj of this._getEntityFields(entityName)) {
            let { field, name } = fieldObj;
            name = name || field;
            details[name] = Util.getPath(entity, field);
        }
        return details;
    }
}

export default BaseDomain;