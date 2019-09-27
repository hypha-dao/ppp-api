
export const main = async event => {

    const { request: { session }, response } = event;
    if (session && session.length >= 3 &&
        session.slice(-1)[0].challengeResult === false) {
        // The user provided a wrong answer 3 times; fail auth
        response.issueTokens = false;
        response.failAuthentication = true;
    } else if (session && session.length &&
        session.slice(-1)[0].challengeResult === true) {
        // The user provided the right answer; succeed auth
        response.issueTokens = true;
        response.failAuthentication = false;
    } else {
        // The user did not provide a correct answer yet; present challenge
        response.issueTokens = false;
        response.failAuthentication = false;
        response.challengeName = 'CUSTOM_CHALLENGE';
    }

    return event;
}
