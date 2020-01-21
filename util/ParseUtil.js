import querystring from 'querystring';

class ParseUtil {

  static parseBody(body) {
    let payload = null;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      payload = querystring.parse(body);
    }
    return payload;
  }
}

export default ParseUtil;