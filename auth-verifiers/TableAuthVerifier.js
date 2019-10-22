import BaseAuthVerifier from './BaseAuthVerifier';
import eosRpc from '../service/EosRpc';

class TableAuthVerifier extends BaseAuthVerifier {

    async verify(eosAcccount, loginCode, retries, timeout, decrement) {

        try {
            console.log(`eosAccount: ${eosAcccount}, loginCode: ${loginCode}, retries: ${retries}, timeout: ${timeout}, decrement: ${decrement}`);
            const {
                authContract,
            } = process.env;

            const row = await eosRpc.getOneTableRow({
                code: authContract,
                table: 'logins',
                lowerBound: eosAcccount,
                upperBound: eosAcccount,
            });
            console.log('Logins table row: ', row);
            return row && row.login_code === loginCode;
        } catch (error) {
            console.log('Error verifying login: ', error);
            return false;
        }
    }
}

export default TableAuthVerifier;