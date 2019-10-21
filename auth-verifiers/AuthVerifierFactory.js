import { AuthVerifierKeys } from '../const';
import ActionHistoryAuthVerifier from './ActionHistoryAuthVerifier';
import TableAuthVerifier from './TableAuthVerifier';

class AuthVerifierFactory {

    static get(key) {
        switch (key) {
            case AuthVerifierKeys.ACTION_HISTORY:
                return new ActionHistoryAuthVerifier();
            case AuthVerifierKeys.TABLE:
                return new TableAuthVerifier();
            default:
                throw new Error("Unknown authentication verifier");
        }
    }
}

export default AuthVerifierFactory;