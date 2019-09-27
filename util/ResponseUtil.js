
class ResponseUtil {

    static success(body) {
        return this.buildResponse(200, body);
    }

    static failure(message) {
        return this.buildResponse(500, {
            message,
        });
    }

    static buildResponse(statusCode, body) {
        return {
            statusCode: statusCode,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify(body)
        };
    }
}

export default ResponseUtil;


