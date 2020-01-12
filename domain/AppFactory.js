import { AppTypes } from '@smontero/ppp-common'
import { NonWebApp, WebApp } from './'

class AppFactory {
  static getInstance(type, props, appDao) {
    switch (type) {
      case AppTypes.NON_WEB_APP:
        return new NonWebApp(props, appDao);
      case AppTypes.WEB_APP:
        return new WebApp(props, appDao);
      default:
        throw `Unknown app type: ${type}`;
    }
  }
}

export default AppFactory;