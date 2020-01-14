class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        console.log('Before capture stack trace');
        Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    }
}
export default DomainError;
