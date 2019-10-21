import { AuthVerifierFactory } from './auth-verifiers';

let verifier = null;

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
        authVerifier,
        authRetries,
        startAuthTimeout,
        minAuthTimeout
    } = process.env;
    console.log('event:', event);
    const decrement = Math.floor((startAuthTimeout - minAuthTimeout) / authRetries);

    if (!verifier) {
        verifier = AuthVerifierFactory.get(authVerifier);
    }
    //response.answerCorrect = await verfier.verify(userName, loginCode, authRetries, startAuthTimeout, decrement);
    response.answerCorrect = true;
    return event;
};