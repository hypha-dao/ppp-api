class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    }
}
export default DomainError;
