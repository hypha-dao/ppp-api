
class ResponseUtil {

    static success(body, dontCache = false) {
        return this.buildResponse(200, body);
    }

    static failure(error, httpCode = 500) {
        const payload = error.payload ?
            error.payload() :
            {
                message: error.message || error,
            };

        return this.buildResponse(httpCode, payload);
    }

    static buildResponse(statusCode, body, dontCache = false) {
        let headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        };
        if (dontCache) {
            headers = {
                ...headers,
                'Cache-Control': 'no-store',
                'Pragma': 'no-cache'
            };
        }
        return {
            statusCode,
            headers,
            body: JSON.stringify(body)
        };
    }
}

export default ResponseUtil;


