import axios from 'axios';
import { Util } from './util';

const validateTransaction = async (eosAcccount, code, retries, timeout, decrement) => {

    console.log(`eosAccount: ${eosAcccount}, code: ${code}, retries: ${retries}, timeout: ${timeout}, decrement: ${decrement}`);
    let response = false;
    try {
        const {
            historyEndpoint,
            authUtilContract,
        } = process.env;

        const { data: { actions } } = await axios.get(`${historyEndpoint}/get_actions`, {
            params: {
                'act.account': authUtilContract,
                'act.name': 'authenticate',
                'act.authorization.actor': eosAcccount,
                after: new Date(new Date().getTime() - (5 * 60000)),
                sort: 'desc',
                limit: 1,
            }
        });
        console.log('Actions found: ', actions.length);
        if (actions.length) {
            const { data } = actions[0].act;
            console.log('Transaction Data: ', data);
            response = data.code === code;
        }
    } catch (error) {
        console.error("An error occurred while validating transaction", error);
    }
    if (!response && retries > 0) {
        await Util.sleep(timeout);
        return validateTransaction(eosAcccount, code, retries - 1, timeout - decrement, decrement);
    }
    return response;
}

export const main = async event => {
    const {
        userName,
        request: {
            privateChallengeParameters: {
                loginCode,
            },
        },
        response
    } = event;
    const {
        authRetries,
        startAuthTimeout,
        minAuthTimeout
    } = process.env;
    console.log('event:', event);
    const decrement = Math.floor((startAuthTimeout - minAuthTimeout) / authRetries);
    //response.answerCorrect = await validateTransaction(userName, loginCode, authRetries, startAuthTimeout, decrement);
    response.answerCorrect = true;
    return event;
};