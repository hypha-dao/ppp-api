import assert from 'assert';
import AWS from 'aws-sdk';
import { Util } from '../util';

AWS.config.update({ region: 'us-east-1' });

class BaseDao {
    constructor(tableName, idProps, optimisticLocking = false) {
        this.db = new AWS.DynamoDB.DocumentClient();
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

    async query(query, limit, lastEvaluatedKey) {

        limit && (query.Limit = limit);
        lastEvaluatedKey && (query.ExclusiveStartKey = lastEvaluatedKey);

        const {
            Items: items,
            Count: count,
            LastEvaluatedKey: newLastEvaluatedKey,
        } = await this.exec('query', query);

        let pRS = {
            items,
            count,
        };
        newLastEvaluatedKey && (pRS.lastEvaluatedKey = newLastEvaluatedKey);
        return pRS;
    }

    async queryOne(query, limit, lastEvaluatedKey) {
        const { count, items } = await this.query(query, limit, lastEvaluatedKey);
        return count > 0 ? items[0] : null;
    }

    async put(item, queryOpts = {}, optimisticLocking = null) {
        queryOpts.Item = item;
        if (this._isOptimisticaLocking(optimisticLocking)) {
            this.versionCondition(queryOpts);
        }
        console.log('Query Opts: ', JSON.stringify(queryOpts, null, 2));
        return this.exec('put', queryOpts);
    }

    async get(hash, range = null, queryOpts = {}) {
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
        queryOpts.Key = key;
        console.log(`Key:`, key);
        const { Item } = await this.exec('get', queryOpts);
        return Item;
    }

    async transactWrite(items, optimisticLocking = null) {
        if (this._isOptimisticaLocking(optimisticLocking)) {
            this._iterateTransactItems(items, (item) => this.versionCondition(item));
        }
        console.log('Items: ', JSON.stringify(items, null, 2));
        return this.transact('transactWrite', items);
    }

    _toPutItems(items) {
        return items.map((item) => {
            return {
                Put: {
                    TableName: this.tableName,
                    Item: item,
                },
            };
        });
    }

    async transactPut(items) {
        return this.transactWrite(this._toPutItems(items));
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


    async batchGet(keys, queryOpts = {}) {
        queryOpts.Keys = this._toHashRange(keys);
        return this._batchGet({ [this.tableName]: queryOpts });
    }

    async transact(op, items) {
        this._iterateTransactItems(items, (item) => this._preProcessQuery(item));
        console.log('Transact items:', JSON.stringify(items, null, 2));
        return this.db[op]({ TransactItems: items }).promise();
    }

    async _batchGet(query) {
        query = { RequestItems: query };
        console.log('BatchGet query: ', JSON.stringify(query, null, 2));
        let response = await this.db.batchGet(query).promise();
        let { UnprocessedKeys, Responses: { [this.tableName]: results } } = response;
        if (!Util.isEmptyObj(UnprocessedKeys)) {
            const ukResults = await this._batchGet(UnprocessedKeys);
            results = [...results, ...ukResults];
        }
        return results;

    }

    async exec(op, query) {
        this._preProcessQuery(query);
        return this.db[op](query).promise();
    }


    notExistsCondition(obj, attr = null) {
        attr = attr || this.idProps.hashProp;
        this.condition(obj, `attribute_not_exists(${attr})`);
    }

    versionCondition(query) {
        const { Item: item } = query;
        if (item.version) {
            this.condition(query, 'version = :version');
            query.ExpressionAttributeValues = query.ExpressionAttributeValues || {};
            query.ExpressionAttributeValues[':version'] = item.version;
            item.version += 1;
        } else {
            this.notExistsCondition(query);
            item.version = 1;
        }
    }

    condition(query, condition) {
        query.ConditionExpression = condition;
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

    _isOptimisticaLocking(optimisticLocking) {
        return optimisticLocking == null ? this.optimisticLocking : optimisticLocking;
    }
}

export default BaseDao;