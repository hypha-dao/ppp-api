import { AppTypes } from '@smontero/ppp-common'
import { StandaloneApp, WebApp } from './'

class AppFactory {
  static getInstance(type, props, appDao) {
    switch (type) {
      case AppTypes.STANDALONE_APP:
        return new StandaloneApp(props, appDao);
      case AppTypes.WEB_APP:
        return new WebApp(props, appDao);
      default:
        throw `Unknown app type: ${type}`;
    }
  }
}

export default AppFactory;