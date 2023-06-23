import instance from 'api';
import axios from 'axios';
import _ from 'lodash';
import * as Yup from 'yup';
import { backendUrl } from 'setup';
import i18n from 'i18n';
import { moment } from 'i18n';
import { isTrue, formatCrypto, getDecimalPrecision, isFalse } from 'utils';
import { initializeThemes, triggerModalOpen } from 'redux/actions/ui';
import { setNumberFormat } from 'redux/actions/userSettings';

export const LOAD_SETTINGS_STARTED = 'LOAD_SETTINGS_STARTED';
export const LOAD_SETTINGS_SUCCESS = 'LOAD_SETTINGS_SUCCESS';
export const LOAD_SETTINGS_FAIL = 'LOAD_SETTINGS_FAIL';
export const SET_ERROR_STATUS_451 = 'SET_ERROR_STATUS_451';
export const LOAD_LANGUAGE_LIST_SUCCESS = 'LOAD_LANGUAGE_LIST_SUCCESS';
export const LOAD_CURRENCY_SETTINGS_STARTED = 'LOAD_CURRENCY_SETTINGS_STARTED';
export const LOAD_CURRENCY_SETTINGS_SUCCESS = 'LOAD_CURRENCY_SETTINGS_SUCCESS';
export const LOAD_CURRENCY_SETTINGS_FAIL = 'LOAD_CURRENCY_SETTINGS_FAIL';
export const LOAD_FEE_DISCOUNT_TIERS_STARTED =
  'LOAD_FEE_DISCOUNT_TIERS_STARTED';
export const LOAD_FEE_DISCOUNT_TIERS_SUCCESS =
  'LOAD_FEE_DISCOUNT_TIERS_SUCCESS';
export const LOAD_FEE_DISCOUNT_TIERS_FAIL = 'LOAD_FEE_DISCOUNT_TIERS_FAIL';
export const LOAD_CONTENT_PAGES_STARTED = 'LOAD_CONTENT_PAGES_STARTED';
export const LOAD_CONTENT_PAGES_SUCCESS = 'LOAD_CONTENT_PAGES_SUCCESS';
export const LOAD_CONTENT_PAGES_FAIL = 'LOAD_CONTENT_PAGES_FAIL';
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
export const CHANGE_FIAT_CODE = 'CHANGE_FIAT_CODE';
export const SET_ERROR_STATUS = 'SET_ERROR_STATUS';
export const SET_COOKIES_ENABLED = 'SET_COOKIES_ENABLED';
export const SET_COOKIE_CONSENT = 'SET_COOKIE_CONSENT';

const formatSettings = async (settings, overrides) => {
  const {
    _CoName,
    _xrp_address,
    kyc,
    tdM_Token_Name,
    disable_RM,
    disable_TDM,
    enable_TDM_Pay_IN_Exchange_Token,
    logo_Url,
    disable_Login,
    enable_AeraPass,
    aeraPass_Url,
    favIcon_Url,
    navBarLogo_Url,
    enable_InstaTrade,
    enable_P2P_Trading,
    enable_SocialTrade,
    enable_DSSO,
    mgokx,
    enable_PhoneVerification,
    enable_CopyTrade,
    fiat_List,
    default_Pair,
    trade_setting,
    market_groups,
    markets,
    enable_Simplex,
    enable_CryptoForecasting,
    enable_DustConversion,
    auto_Sell,
    mfa_Type,
    exchange_SupportDesk_URL,
    enable_SecurityTokens,
    enable_CryptoFeatures,
    withdrawals_Forced_2FA,
    withdrawal_Address_Whitelisting,
    password_Strength = '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$',
    signup_mobile_verfication,
    notification,
    ...rest
  } = settings;

  const {
    marketLookup,
    exchangeMarkets,
    marketsByGroup,
    groupedOnlyPairs,
    tradingPairGroupSettings,
  } = await getMarketGroups(
    markets,
    market_groups,
    isTrue(enable_SecurityTokens),
  );

  return {
    xrpAddress: _xrp_address,
    kyc: {
      isGoKyc: isTrue(kyc?.enable_GoKYC),
      isSumSubIframe: isTrue(kyc?.enable_SumSub_iframe),
      webSdkProviderName: kyc?.webSDK_Provider_Name,
    },
    exchangeToken: tdM_Token_Name,
    enableReferrals: !isTrue(disable_RM),
    enableDustConversion: isTrue(enable_DustConversion),
    enableExchangeToken: !isTrue(disable_TDM),
    enablePayInExchangeToken: isTrue(enable_TDM_Pay_IN_Exchange_Token),
    enableCopyTrade: isTrue(enable_CopyTrade),
    enableInstaTrade: isTrue(enable_InstaTrade),
    enableP2PTrading: isTrue(enable_P2P_Trading),
    enableSocialTrade: isTrue(enable_SocialTrade),
    enableDSSO: isTrue(enable_DSSO),
    mgokx: mgokx,
    enablePhoneVerification: isTrue(enable_PhoneVerification),
    signupMobileVerfication: signup_mobile_verfication,
    enableSimplex: isTrue(enable_Simplex),
    enableCryptoForecasting: isTrue(enable_CryptoForecasting),
    enableAutoSell: isTrue(auto_Sell),
    logoUrl: logo_Url,
    navbarLogoUrl: navBarLogo_Url ? navBarLogo_Url : logo_Url,
    faviconUrl: favIcon_Url,
    enableLogin: !isTrue(disable_Login),
    aeraPassEnabled: isTrue(enable_AeraPass),
    aeraPassUrl: isFalse(aeraPass_Url) ? false : aeraPass_Url,
    supportUrl: isFalse(exchange_SupportDesk_URL)
      ? false
      : exchange_SupportDesk_URL,
    fiatList: fiat_List.split(','),
    defaultPair: default_Pair,
    tradingPairSettings: formatTradingPairsettings(trade_setting),
    marketGroups: market_groups,
    markets,
    marketLookup,
    exchangeMarkets,
    marketsByGroup,
    groupedOnlyPairs,
    tradingPairGroupSettings,
    mfaSettings: mfa_Type,
    enableCryptoFeatures: enable_CryptoFeatures
      ? isTrue(enable_CryptoFeatures)
      : true,
    enableSecurityTokens: isTrue(enable_SecurityTokens),
    enabledAddressWhitelisting: isTrue(withdrawal_Address_Whitelisting),
    passwordStrength: password_Strength,
    currentNotification:
      isFalse(notification) || notification === ' ' ? null : notification,
    ...rest,
    ...overrides,
  };
};

export const setErrorStatus = () => {
  return {
    type: SET_ERROR_STATUS,
    payload: true,
  };
};

export const loadSettings = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: LOAD_SETTINGS_STARTED,
    });
    dispatch(loadLanguages());

    try {
      const response = await axios({
        url: backendUrl + `/api/GetSettings`,
        method: 'GET',
      });

      const data = await response.data;

      const { data: overrides } = await axios({
        url: '/assets/exchange-settings-overrides.json',
        method: 'GET',
      });

      if (data.status === 'Success') {
        // const hasTimeDifference =
        //   Math.abs(data.data.server_Time_UTC - moment().unix()) >= 60;

        // if (hasTimeDifference) {
        //   dispatch(triggerModalOpen('timeDifference'));
        // }

        const settings = await formatSettings(data.data, overrides);

        dispatch({
          type: LOAD_SETTINGS_SUCCESS,
          payload: settings,
        });

        const isCookiesEnabled = checkCookiesEnabled(settings);

        dispatch({
          type: SET_COOKIES_ENABLED,
          payload: isCookiesEnabled,
        });

        dispatch(startSeoScripts());

        // if (_.get(settings, 'themes')) {
        dispatch(initializeThemes());
        // }

        // dispatch(loadContentPages());
        dispatch(initializeLocale());
      }
    } catch (error) {
      if (error && error.response && error.response.status == 451) {
        dispatch({
          type: SET_ERROR_STATUS_451,
        });
        return;
      }
      dispatch({
        type: LOAD_SETTINGS_FAIL,
      });
      // console.log(error);
    }
  };
};

const checkCookiesEnabled = ({
  seo: { google_Analytics_ID, google_Tag_Manager },
}) => {
  return (
    _.startsWith(google_Analytics_ID, 'UA') ||
    _.startsWith(google_Tag_Manager, 'GTM')
  );
};

const startSeoScripts = () => {
  return (dispatch, getState) => {
    const {
      hasCookieConsent,
      enableCookieConsent,
      settings: {
        seo: { google_Analytics_ID, google_Tag_Manager },
      },
    } = getState().exchangeSettings;

    if (enableCookieConsent && hasCookieConsent) {
      if (_.startsWith(google_Analytics_ID, 'UA')) {
        // const ReactGA = require('react-ga');
        // ReactGA.initialize(google_Analytics_ID);
      }

      if (_.startsWith(google_Tag_Manager, 'GTM')) {
        const TagManager = require('react-gtm-module');

        TagManager.initialize({
          gtmId: google_Tag_Manager,
        });
      }
    }
  };
};

const formatTradingPairsettings = settings => {
  const tradingPairSettings = {};

  settings.forEach(
    ({ coinName, marketName, minTickSize, minTradeAmount, minOrderValue }) => {
      tradingPairSettings[`${coinName}${marketName}`] = {
        minTickSize,
        minTradeAmount,
        minOrderValue,
        tickDecimals: getDecimalPrecision(minTickSize),
        tradeAmountDecimals: getDecimalPrecision(minTradeAmount),
        orderValueDecimals: getDecimalPrecision(minOrderValue),
      };
    },
  );

  return tradingPairSettings;
};

const getMarketGroup = marketGroups => market => {
  let marketGroup = {
    marketGroup: market,
    isGrouped: false,
    markets: [market],
  };

  marketGroups.forEach(singleGroup => {
    if (_.includes(singleGroup.markets, market)) {
      marketGroup = {
        marketGroup: singleGroup.label,
        isGrouped: true,
        markets: singleGroup.markets,
      };
    }
  });

  return marketGroup;
};

const getSecurityTokenGroups = async () => {
  try {
    const { data } = await instance({
      url: 'api/getSecurityTokenGroups',
      method: 'GET',
    });

    if (data.status === 'Success') {
      return data.data.tradingPairGroups.length
        ? data.data.tradingPairGroups
        : [];
    }

    return [];
  } catch (e) {
    return [];
  }
};

const getMarketGroups = async (markets, marketGroups, checkSecurityTokens) => {
  const getMarket = getMarketGroup(marketGroups);
  const marketLookup = {};
  const marketsByGroup = {};
  const exchangeMarkets = [];
  const primaryMarkets = [];
  const groupedMarkets = [];
  const groupedOnlyPairs = {};
  let tradingPairGroups = [];
  let tradingPairGroupSettings = {};

  if (checkSecurityTokens) {
    tradingPairGroups = await getSecurityTokenGroups();
  }

  markets.forEach(singleMarket => {
    const market = getMarket(singleMarket);
    marketLookup[singleMarket] = market.marketGroup;
    exchangeMarkets.push(market);
    marketsByGroup[market.marketGroup] = market.markets;
  });

  exchangeMarkets.forEach(singleMarket => {
    if (singleMarket.isGrouped) {
      groupedMarkets.push(singleMarket.marketGroup);
    } else {
      primaryMarkets.push(singleMarket.marketGroup);
    }
  });

  tradingPairGroups.forEach(singleGroup => {
    groupedMarkets.push(singleGroup.label);
    tradingPairGroupSettings[singleGroup.label] = singleGroup;
    marketsByGroup[singleGroup.label] = [];
    singleGroup.tradingPairs.forEach(({ baseCurrency, quoteCurrency }) => {
      _.set(groupedOnlyPairs, `${quoteCurrency}.${baseCurrency}`, true);
      marketsByGroup[singleGroup.label].push(
        `${baseCurrency}_${quoteCurrency}`,
      );
    });
  });

  return {
    marketLookup,
    marketsByGroup,
    exchangeMarkets: [
      ...new Set(['favorites', ...primaryMarkets, ...groupedMarkets]),
    ],
    groupedOnlyPairs,
    tradingPairGroupSettings,
  };
};

export const loadLanguages = () => {
  return async (dispatch, getState) => {
    try {
      const { data } = await instance({
        url: '/api/language_list',
        method: 'GET',
      });

      if (data.status === 'Success') {
        const { fullLanguage, language } = getState().exchangeSettings;
        const languageList = data.data;
        _.remove(languageList, { code: 'df' });

        dispatch({
          type: LOAD_LANGUAGE_LIST_SUCCESS,
          payload: languageList,
        });

  
        if (_.isEmpty(fullLanguage) && languageList[0]) {
          const detectedLanguage = navigator.language || navigator.userLanguage;
          let resultDetected = _.find(languageList, function(n) {
            if (n.code.toLowerCase() === detectedLanguage.toLowerCase()) {
              return true;
            }
          });
  
          if (resultDetected) {
            dispatch(changeLanguage(resultDetected));
          } else {
            const languageObject = _.find(
              languageList,
              { code: language },
              languageList[0],
            );
            dispatch(changeLanguage(languageObject));
          }
        }
      }
    } catch (e) {}
  };
};

export const changeLanguage = language => {
  i18n.changeLanguage(language.code);

  return dispatch => {
    dispatch({
      type: CHANGE_LANGUAGE,
      payload: language,
    });

    dispatch(initializeLocale());
  };
};

export const changeFiat = code => {
  return dispatch => {
    dispatch({
      type: CHANGE_FIAT_CODE,
      payload: code,
    });
  };
};

export const initializeLocale = () => {
  return (dispatch, getState) => {
    const {
      exchangeSettings: {
        language,
        settings: { mfaSettings },
      },
      userSettings: { numberFormat },
    } = getState();

    dispatch(setNumberFormat(numberFormat));

    moment.locale(language);

    Yup.setLocale({
      mixed: {
        required: () => i18n.t('forms.validations.required'),
      },
      string: {
        required: () => i18n.t('forms.validations.required'),
        min: ({ min }) => i18n.t('forms.validations.min', { length: min }),
        max: ({ max }) => i18n.t('forms.validations.max', { length: max }),
        email: () => i18n.t('forms.validations.email'),
      },
      number: {
        min: ({ min }) =>
          i18n.t('forms.validations.minNumber', {
            number: formatCrypto(min, true),
          }),
        max: ({ max }) =>
          i18n.t('forms.validations.maxNumber', {
            number: formatCrypto(max, true),
          }),
      },
    });

    if (mfaSettings) {
      const { name, codeLength } = mfaSettings;
      const mfaName = i18n.t(`multiFactorAuth.${name}`);
      const downloadUrl = i18n.t(`multiFactorAuth.${name}DownloadUrl`);
      i18n.addResource(
        language,
        'translation',
        'multiFactorAuth.name',
        mfaName,
      );
      i18n.addResource(
        language,
        'translation',
        'multiFactorAuth.download',
        downloadUrl,
      );
      i18n.addResource(
        language,
        'translation',
        'multiFactorAuth.length',
        codeLength.toString(),
      );
    }
  };
};

export const loadCurrencySettings = () => {
  return async dispatch => {
    dispatch({
      type: LOAD_CURRENCY_SETTINGS_STARTED,
    });

    try {
      const { data } = await instance({
        url: '/api/CurrencySettings',
        method: 'GET',
      });

      if (data.status === 'Success') {
        let currencies = {};

        data.data.forEach(singleCurrency => {
          currencies[singleCurrency.shortName] = singleCurrency;
        });
        dispatch({
          type: LOAD_CURRENCY_SETTINGS_SUCCESS,
          payload: currencies,
        });
      }
    } catch (e) {
      dispatch({
        type: LOAD_CURRENCY_SETTINGS_FAIL,
      });
    }
  };
};

export const loadTokenFeeSettings = () => {
  return async dispatch => {
    dispatch({
      type: LOAD_FEE_DISCOUNT_TIERS_STARTED,
    });

    try {
      const { data } = await instance({
        url: '/api/GetDiscountTiers',
        method: 'GET',
      });

      if (data.status === 'Success') {
        dispatch({
          type: LOAD_FEE_DISCOUNT_TIERS_SUCCESS,
          payload: data.data,
        });
      }
    } catch (e) {
      dispatch({
        type: LOAD_FEE_DISCOUNT_TIERS_FAIL,
      });
    }
  };
};

// export const loadContentPages = () => {
//   return async dispatch => {
//     dispatch({
//       type: LOAD_CONTENT_PAGES_STARTED,
//     });

//     try {
//       const { data } = await instance({
//         url: '/api/get_page_n_content',
//         method: 'GET',
//       });

//       let contentPages = {};

//       data.data.forEach(({ name, content }) => {
//         contentPages[name] = {
//           url: `/${_.kebabCase(name)}`,
//           active: !_.isEmpty(content),
//           content,
//           name,
//         };
//       });

//       if (data.status === 'Success') {
//         dispatch({
//           type: LOAD_CONTENT_PAGES_SUCCESS,
//           payload: contentPages,
//         });
//       }
//     } catch (e) {
//       dispatch({
//         type: LOAD_CONTENT_PAGES_FAIL,
//       });
//     }
//   };
// };

export const setCookieConsent = isEnabled => {
  return dispatch => {
    dispatch({
      type: SET_COOKIE_CONSENT,
      payload: isEnabled,
    });

    if (isEnabled) {
      dispatch(startSeoScripts());
    }
  };
};
