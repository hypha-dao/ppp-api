import assert from 'assert';
import AWS from 'aws-sdk';
import { Util } from '../util';

AWS.config.update({ region: 'us-east-1' });

const MAX_RETRIES = 5;

class BaseDao {
    constructor(tableName, idProps, optimisticLocking = false) {
        this.db = new AWS.DynamoDB.DocumentClient({convertEmptyValues:true});
        this.tableName = tableName;
        if (Util.isString(idProps)) {
            idProps = {
                hashProp: idProps,
            };
        }
        this.idProps = idProps;
        this.optimisticLocking = optimisticLocking;
    }

    appAttributes(appId, attributes) {
        return attributes.map((attr) => this.appAttribute(appId, attr));
    }

    appAttribute(appId, attribute) {
        return `${appId}/${attribute}`;
    }

    async query(query, limit, lastEvaluatedKey, retries = MAX_RETRIES) {
        return this._queryOrScan('query', query, limit, lastEvaluatedKey, retries);
    }

    async queryAll(query) {
        let lastEvaluatedKey = null;
        let allItems = [];
        do {
            const { items, lastEvaluatedKey } = await this.query(query, null, lastEvaluatedKey);
            allItems = allItems.concat(items);
        } while (lastEvaluatedKey);
        return allItems;
    }

    async scan(query, limit, lastEvaluatedKey, retries = MAX_RETRIES) {
        return this._queryOrScan('scan', query || {}, limit, lastEvaluatedKey, retries);
    }

    async scanMap(keyProp, isKeyUnique = true, valueProp = null) {
        const { items } = await this.scan();
        return Util.arrayToMap(items, keyProp, isKeyUnique, valueProp);
    }

    async _queryOrScan(op, query, limit, lastEvaluatedKey, retries = MAX_RETRIES) {
        try {
            limit && (query.Limit = limit);
            lastEvaluatedKey && (query.ExclusiveStartKey = lastEvaluatedKey);
            console.log('Queries: ', query);
            const {
                Items: items,
                Count: count,
                LastEvaluatedKey: newLastEvaluatedKey,
            } = await this.exec(op, query);

            let pRS = {
                items,
                count,
            };
            newLastEvaluatedKey && (pRS.lastEvaluatedKey = newLastEvaluatedKey);
            console.log('query results:', pRS);
            return pRS;
        } catch (error) {
            if (this._shouldRetry(error, retries)) {
                return await this.query(query, limit, lastEvaluatedKey, retries - 1);
            }
            throw error;
        }
    }

    async queryOne(query, limit, lastEvaluatedKey) {
        const { count, items } = await this.query(query, limit, lastEvaluatedKey);
        return count > 0 ? items[0] : null;
    }

    async put(item, queryOpts = {}, optimisticLocking = null) {
        queryOpts.Item = item;
        if (this._isOptimisticLocking(optimisticLocking)) {
            this.versionCondition(queryOpts);
        }
        console.log('Query Opts: ', JSON.stringify(queryOpts, null, 2));
        return this.exec('put', queryOpts);
    }

    async update(hash, range = null, queryOpts = {}) {
        queryOpts.Key = this._getKeyProp(hash, range);
        return this.exec('update', queryOpts);

    }

    async get(hash, range = null, queryOpts = {}) {
        queryOpts.Key = this._getKeyProp(hash, range);
        const { Item } = await this.exec('get', queryOpts);
        return Item;
    }

    _getKeyProp(hash, range = null) {
        const {
            hashProp,
            rangeProp,
        } = this.idProps;
        let key = {
            [hashProp]: hash,
        };
        if (rangeProp) {
            key[rangeProp] = range;
        }
        console.log(`Key:`, key);
        return key;
    }

    async transactWrite(items, optimisticLocking = null) {
        if (this._isOptimisticLocking(optimisticLocking)) {
            this._iterateTransactItems(items, (item) => this.versionCondition(item));
        }
        console.log('Items: ', JSON.stringify(items, null, 2));
        return this.transact('transactWrite', items);
    }

    _toTransactPutItems(items) {
        items = Array.isArray(items) ? items : [items];
        return items.map((item) => {
            return {
                Put: {
                    TableName: this.tableName,
                    Item: item,
                },
            };
        });
    }

    _toBatchPutItems(items) {
        items = items.map((item) => {
            return {
                PutRequest: {
                    Item: item,
                },
            };
        });
        return {
            [this.tableName]: items,
        };
    }

    async transactPut(items) {
        return this.transactWrite(this._toTransactPutItems(items));
    }

    async transactGet(items) {
        const { hashProp } = this.idProps;
        items = items.map((item) => {
            if (!item.Get) {
                if (Util.isString(item)) {
                    item = { [hashProp]: item };
                }
                item = {
                    Get: {
                        Key: item,
                    }
                }
            }
            return item;
        });

        const { Responses: responses } = await this.transact('transactGet', items);
        console.log(responses);
        let results = [];
        for (const response of responses) {
            response.Item && results.push(response.Item);
        }
        return results;
    }

    _toHashRange(keys) {
        const { hashProp, rangeProp } = this.idProps;

        if (!keys.length || keys[0][hashProp]) {
            return keys;
        }
        const pKeys = [];
        for (let key of keys) {
            key = Array.isArray(key) ? key : [key];
            let [hash, range] = key;
            if (rangeProp) {
                assert(range, 'Key must include values for hash and range props');
                hash = Array.isArray(hash) ? hash : [hash];
                range = Array.isArray(range) ? range : [range];
                if (!hash.length || !range.length) {
                    return pKeys;
                }
                let singleProp;
                let multiProp;
                let singleValue;
                let multiValue;
                if (hash.length > 1) {
                    multiProp = hashProp;
                    multiValue = hash;
                    singleProp = rangeProp;
                    singleValue = range[0];
                } else {
                    multiProp = rangeProp;
                    multiValue = range;
                    singleProp = hashProp;
                    singleValue = hash[0];
                }
                for (const val of multiValue) {
                    pKeys.push({
                        [singleProp]: singleValue,
                        [multiProp]: val,
                    });
                }
            } else {
                pKeys.push({ [hashProp]: hash });
            }
        }
        return pKeys;
    }

    async batchGetMap(keys, keyProp, queryOpts = {}) {
        const results = await this.batchGet(keys, queryOpts);
        return Util.arrayToMap(results, keyProp);
    }

    async batchGet(keys, queryOpts = {}) {
        const qKeys = this._toHashRange(keys);
        if (!qKeys.length) {
            return [];
        }
        queryOpts.Keys = qKeys;
        return this._batchGet({ [this.tableName]: queryOpts });
    }

    async _batchGet(query, retries = MAX_RETRIES) {
        let fullResults = [];
        do {
            try {
                console.log('BatchGet query: ', JSON.stringify(query, null, 2));
                let response = await this.db.batchGet({ RequestItems: query }).promise();
                let { UnprocessedKeys, Responses: { [this.tableName]: results } } = response;
                query = Util.isEmptyObj(UnprocessedKeys) ? null : UnprocessedKeys;
                fullResults = [...fullResults, ...results];
            } catch (error) {
                console.error('Error in _batchGet:', error);
                if (!this._shouldRetry(error, retries)) {
                    throw error;
                }
                retries--;
            }
        } while (query);

        return fullResults;

    }

    async batchWrite(items) {
        return this._batchWrite(this._toBatchPutItems(items));
    }

    async _batchWrite(query, retries = MAX_RETRIES) {
        do {
            try {
                console.log('BatchWrite query: ', JSON.stringify(query, null, 2));
                let response = await this.db.batchWrite({ RequestItems: query }).promise();
                let { UnprocessedKeys } = response;
                query = Util.isEmptyObj(UnprocessedKeys) ? null : UnprocessedKeys;
            } catch (error) {
                console.error('Error in _batchWrite:', error);
                if (!this._shouldRetry(error, retries)) {
                    throw error;
                }
                retries--;
            }
        } while (query);
    }

    async updateItems(fetchQuery, itemUpdateFn) {
        console.log('Fetch Query: ', fetchQuery);
        let lastEvaluatedKey = null;
        let items = null;
        let count = null;
        do {
            ({ items, lastEvaluatedKey, count } = await this.query(fetchQuery, null, lastEvaluatedKey));
            if (count > 0) {
                items = items.map(itemUpdateFn);
                await this.batchWrite(items);
            }
        } while (lastEvaluatedKey);

    }

    _shouldRetry(error, retries) {
        const { code } = error;
        return retries > 0 &&
            (
                code === 'InternalServerError' ||
                code === 'ItemCollectionSizeLimitExceededException' ||
                code === 'ProvisionedThroughputExceededException' ||
                code === 'RequestLimitExceeded'
            );
    }

    async transact(op, items) {
        this._iterateTransactItems(items, (item) => this._preProcessQuery(item));
        console.log('Transact items:', JSON.stringify(items, null, 2));
        return this.db[op]({ TransactItems: items }).promise();
    }



    async exec(op, query) {
        this._preProcessQuery(query);
        return this.db[op](query).promise();
    }


    notExistsCondition(obj, attr = null) {
        attr = attr || this.idProps.hashProp;
        this.condition(obj, `attribute_not_exists(${attr})`);
        return obj;
    }

    valueCondition(query, attrName, value) {
        this.condition(query, `${attrName} = :${attrName}`);
        query.ExpressionAttributeValues = query.ExpressionAttributeValues || {};
        query.ExpressionAttributeValues[`:${attrName}`] = value;
        return query;
    }

    versionCondition(query) {
        const { Item: item } = query;
        if (item.version) {
            this.valueCondition(query, 'version', item.version);
            item.version += 1;
        } else {
            this.notExistsCondition(query);
            item.version = 1;
        }
        return query;
    }

    condition(query, condition) {
        query.ConditionExpression = condition;
        return query;
    }

    _iterateTransactItems(items, fn) {
        for (let item of items) {
            for (let key in item) {
                fn(item[key]);
            }
        }
    }

    _preProcessQuery(query) {
        if (!query.TableName) {
            query.TableName = this.tableName;
        }
    }

    _isOptimisticLocking(optimisticLocking) {
        return optimisticLocking == null ? this.optimisticLocking : optimisticLocking;
    }
}

export default BaseDao;