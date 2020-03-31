import isPlainObject from 'is-plain-object';
import uuid from "uuid";
import crypto from 'crypto'

class Util {
    static isEmptyObj(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }

    static isString(value) {
        return typeof value === 'string' || value instanceof String;
    }

    static uuid() {
        return uuid.v1();
    }

    static randomString(bits = 256) {
        return crypto.randomBytes(bits / 8).toString('hex');
    }

    /**
     * Creates path in object if it does not exist
     * 
     * @param {object} obj 
     * @param {string} path string path separated by '.' char
     */
    static createPath(obj, path, value = {}) {
        const steps = path.split('.');
        obj = obj || {};
        let currentObj = obj;
        for (let i = 0; i < steps.length - 1; i++) {
            const step = steps[i];
            if (currentObj[step] == null) {
                currentObj[step] = {};
            }
            currentObj = currentObj[step];
        }
        const lastStep = steps[steps.length - 1];
        if (currentObj[lastStep] == null) {
            currentObj[lastStep] = value;
        }
        return obj;
    }

    static getPropertyValue(obj, property, typeMode = false) {
        if (obj) {
            obj = obj[property];
        }
        if (typeMode && obj) {
            obj = obj[Object.keys(obj)[0]];
        }
        return obj;
    }

    /**
     * Gets path in object if it does not exist return value
     * 
     * @param {object} obj 
     * @param {string} path string path separated by '.' char
     */
    static getPath(obj, path, value, typeMode = false) {
        const steps = path.split('.');
        let currentObj = obj;
        let i = 0;
        while (currentObj && i < steps.length - 1) {
            currentObj = this.getPropertyValue(currentObj, steps[i], typeMode);
            i++;
        }
        if (!currentObj) {
            return value;
        }
        currentObj = this.getPropertyValue(currentObj, steps[steps.length - 1], typeMode);
        return typeof currentObj === 'undefined' ? value : currentObj;
    }

    static removeDuplicates(values) {
        values = Array.isArray(values) ? values : [values];
        return [...new Set(values)];
    }

    /**
     * 
     * @param {String} email 
     */
    static maskEmail(email) {
        const domain = email.substr(email.indexOf('@'));
        return `${email.substr(0, 2)}*****${domain}`;
    }

    /**
     * 
     * @param {String} smsNumber 
     */
    static maskSmsNumber(smsNumber) {
        return `+*****${smsNumber.substr(-3)}`;
    }

    static async hydrate(objs, keyProp, hydratedProp, hydrateFn) {
        let keyValues = [];
        for (const obj of objs) {
            const keyValue = obj[keyProp];
            if (keyValue) keyValues.push(keyValue);
        }
        keyValues = Util.removeDuplicates(keyValues);
        if (keyValues.length === 0) {
            return objs;
        }
        const keyData = await hydrateFn(keyValues);
        for (const obj of objs) {
            obj[hydratedProp] = keyData[obj[keyProp]];
        }
        return objs;
    }

    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static deleteNullsAndEmptyStrings(obj) {
        if (!isPlainObject(obj)) {
            return;
        }
        for (const key in obj) {
            const val = obj[key];
            if (val == null || val === '') {
                delete obj[key];
            } else {
                this.deleteNullsAndEmptyStrings(val);
            }
        }
    }

    static arrayToMap(objs, keyProp, isKeyUnique = true, valueProp = null) {
        const map = {};
        for (const obj of objs) {
            const value = valueProp ? obj[valueProp] : obj;
            let keys = obj[keyProp];
            keys = Array.isArray(keys) ? keys : [keys];
            for (const key of keys) {
                if(!isKeyUnique){
                    map[key] = map[key] || [];
                    map[key].push(value);
                } else {
                    map[key] = value;
                }                
            }
        }
        return map;
    }

    static includesOne(arr1, arr2){
        return arr1.some(x => arr2.includes(x));
    }
}

export default Util;
