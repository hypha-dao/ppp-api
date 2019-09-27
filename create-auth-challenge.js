import { randomDigits } from 'crypto-secure-random-digit';

export const main = async event => {

    const { response } = event;
    let loginCode = randomDigits(10).join('');
    response.publicChallengeParameters = { loginCode };
    response.privateChallengeParameters = { loginCode };
    return event;
};