import Util from './Util';

class ValidationUtil {

  static isValidUrl(url, invalidProtocols) {
    try {
      invalidProtocols = Util.removeDuplicates(invalidProtocols);
      const urlObj = new URL(url);
      const protocol = urlObj.protocol.substring(0, urlObj.protocol.length - 1);
      if (invalidProtocols.indexOf(protocol) > -1) {
        return false;
      }
      return urlObj;
    } catch (e) {
      return false;
    }
  }
}

export default ValidationUtil;  