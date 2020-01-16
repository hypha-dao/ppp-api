import DomainError from './DomainError';

class OauthError extends DomainError {
    constructor(error, errorDesc, cause) {
        super(errorDesc);
        this.error = error;
        this.cause = cause;
    }

    toString() {
        let str = `\nError: ${this.error}}\nError Desc: ${this.message}`;
        if (this.cause) {
            str += `\n Cause: ${this.cause.stack || this.cause}`;
        }
        return str;
    }

    payload() {
        return {
            error: this.error,
            error_description: this.message,
        };
    }
}

OauthError.types = {
    INVALID_REQUEST: 'invalid_request',
    INVALID_CLIENT: 'invalid_client',
    INVALID_GRANT: 'invalid_grant',
    INVALID_SCOPE: 'invalid_scope',
    UNAUTHORIZED_CLIENT: 'unauthorized_client',
    UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
    INVALID_TOKEN: 'invalid_token',
    INSUFFICIENT_SCOPE: 'insufficient_scope',
};

export default OauthError;
