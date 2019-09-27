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

    /**
     * Creates path in object if it does not exist
     * 
     * @param {object} obj 
     * @param {string} path string path separated by '.' char
     */
    static getPath(obj, path, value = null) {
        const steps = path.split('.');
        let currentObj = obj;
        let i = 0;
        while (currentObj && i < steps.length - 1) {
            currentObj = currentObj[steps[i]];
            i++;
        }
        if (!currentObj) {
            return value;
        }
        currentObj = currentObj[steps[steps.length - 1]];
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
}

export default Util;
