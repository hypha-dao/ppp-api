import { AppTypes } from '@smontero/ppp-common'
import { NonWebApp, WebApp } from './'

class AppFactory {
  static getInstance(type, appDao) {
    switch (type) {
      case AppTypes.NON_WEB_APP:
        return new NonWebApp(appDao);
      case AppTypes.WEB_APP:
        return new WebApp(appDao);
      default:
        throw `Unknown app type: ${type}`;
    }
  }
}

export default AppFactory;