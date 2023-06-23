import i18n from 'i18next';
import numbro from 'numbro';
import _ from 'lodash';
import { reactI18nextModule } from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import detector from 'i18next-browser-languagedetector';
import moment from 'moment';
import 'moment/min/locales';
import { backendUrl } from 'setup';
import qs from 'qs';

// We need to handle the case where we cannot get translations from the api. To do this we extended the default
// `Backend` class from i18next-xhr-backend package.
class ExtendedBackend extends Backend {
  loadUrl(url, callback) {
    this.options.ajax(url, this.options, (data, xhr) => {
      const { code, namespace } = qs.parse(url.split('?')[1]);

      if ((xhr.status >= 400 && xhr.status < 600) || xhr.status === 0)
        this.loadUrl(`/locales/${code}/${namespace}.json`, callback);

      let ret, err;
      try {
        const parsed = JSON.parse(data);

        if (
          data &&
          _.get(parsed, 'Data') !== 'InvalidLanguage' &&
          _.get(parsed, 'Status') !== 'Error' &&
          _.get(parsed, 'Data') !== '{}'
        ) {
          ret = this.options.parse(data, url);
        } else {
          this.loadUrl(`/locales/${code}/${namespace}.json`, callback);
        }
      } catch (e) {
        err = 'failed parsing ' + url + ' to json';
      }
      if (err) return callback(err, false);
      callback(null, ret);
    });
  }

  loadBackupLanguage(url) {}
}

const forceServerTransationsInDev = true;

const additionalI18nOptions = process.env.NODE_ENV === 'development' && !forceServerTransationsInDev ? {} : {
  backend: {
    loadPath: `${backendUrl}/api/language?code={{lng}}&namespace={{ns}}`,
    parse: (data, url) => {
      const parsedData = JSON.parse(data);

      if (parsedData.Data) {
        return Object.values(JSON.parse(parsedData.Data))[0];
      } else if (parsedData.data) {
        return Object.values(JSON.parse(parsedData.data))[0];
      }
      return parsedData;
    },
  },
}

i18n
  .use(ExtendedBackend)
  .use(detector)
  .use(reactI18nextModule) // passes i18n down to react-i18next
  .init({
    ...additionalI18nOptions,
    debug: false,
    ns: ['translation'],
    defaultNS: 'translation',
    fallbackLng: 'en', // use en if detected lng is not available
    keySeparator: '.',
    load: 'languageOnly',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      wait: true,
    },
  });

window.i18n = i18n;

export { moment, numbro };

export default i18n;
