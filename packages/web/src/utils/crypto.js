import _ from 'lodash';
import walletAddressValidator from 'crypto-address-validator';

export const hasAddressValidator = currency => {
  const lowerCaseCurrency = currency.toLowerCase();
  const validatorSetting = _.find(
    walletAddressValidator.CURRENCIES,
    ({ name, symbol }) => {
      return (
        name.toLowerCase() === lowerCaseCurrency || symbol === lowerCaseCurrency
      );
    },
  );

  return !!validatorSetting;
};

export const validateAddress = (address, currency) => {
  return walletAddressValidator.validate(address, currency, 'both');
};
