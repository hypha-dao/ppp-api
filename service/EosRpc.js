import { JsonRpc } from 'eosjs';

class EosRpc {
    constructor() {
        const {
            eosHttpEndpoint,
        } = process.env;

        this.rpc = new JsonRpc(eosHttpEndpoint);
    }

    async getAccount(account) {
        return this.rpc.get_account(account);
    }

    /**
     * TODO: Improve the way of how the data is fetched when a filter is passed in to better handle limit,
     *  at the moment we are just putting a very large limit, then filtering and finally implementing the limit
     *
     */
    async getTableRows(
        {
            code,
            scope,
            table,
            indexPosition,
            tableKey,
            lowerBound,
            upperBound,
            keyType,
            limit = 10,
            reverse,
        }
    ) {
        let results = await this.rpc.get_table_rows({
            json: true,
            code,
            scope: scope || code,
            table,
            index_position: indexPosition,
            table_key: tableKey,
            lower_bound: lowerBound,
            upper_bound: upperBound,
            key_type: keyType,
            limit,
            reverse,
        });

        return results;
    }

    async getOneTableRow(
        {
            code,
            scope,
            table,
            indexPosition,
            tableKey,
            upperBound,
            keyType,
            lowerBound,
            reverse,
        },
    ) {
        const { rows } = await this.getTableRows(
            {
                code,
                scope,
                table,
                indexPosition,
                tableKey,
                lowerBound,
                upperBound,
                keyType,
                reverse,
                limit: 1,
            },
        );

        return rows.length ? rows[0] : null;
    }
}

export default new EosRpc();
