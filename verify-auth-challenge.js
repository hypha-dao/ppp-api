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
    const decrement = Math.floor((Number(startAuthTimeout) - Number(minAuthTimeout)) / Number(authRetries));

    if (!verifier) {
        verifier = AuthVerifierFactory.get(authVerifier);
    }
    //response.answerCorrect = await verifier.verify(userName, loginCode, authRetries, startAuthTimeout, decrement);
    response.answerCorrect = true;
    return event;
};