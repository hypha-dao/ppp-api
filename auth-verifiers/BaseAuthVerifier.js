class BaseAuthVerifier {

    async verify(eosAcccount, code, retries, timeout, decrement){
        throw new Error("This method must be implemented by the child class");
    }
}

export default BaseAuthVerifier;