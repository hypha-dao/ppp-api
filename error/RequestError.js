import DomainError from './DomainError';

class RequestError extends DomainError {
    constructor(message, httpCode, cause) {
        super(message);
        this.httpCode = httpCode;
        this.cause = cause;
    }

    toString() {
        return `${super.toString()}\nHTTP Code: ${this.httpCode} \n Error: ${this.cause.stack || this.cause}`;
    }
}

export default RequestError;
