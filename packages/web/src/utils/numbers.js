import _ from 'lodash';
import { numbro } from 'i18n';
import { fx } from 'money';

fx.base = 'USD';

export { fx };

export const convertCurrency = (value, opts) => {
  try {
    if (opts.from == opts.to)
    return value;
    else
    return fx.convert(value, opts);
  } catch (e) {
    return 0;
  }
};

export const formatCrypto = (number = 0, trim = false) => {
  number = number ? number : 0;

  if (isNaN(parseFloat(number))) {
    return number;
  }

  return numbro(number).format({
    trimMantissa: trim,
    mantissa: 8,
  });
};

export const formatFiat = (number = 0, strict = false) => {
  number = number ? number : 0;

  if (isNaN(parseFloat(number))) {
    return number;
  }

  const mantissa = strict ? 2 : number > 1 ? 2 : 6;

  return numbro(number).format({
    trimMantissa: false,
    mantissa,
  });
};

export const formatNumber = (number = 0, decimalPrecision = 8) => {
  number = number ? number : 0;

  if (isNaN(parseFloat(number))) {
    return number;
  }

  number = trimNumber(parseFloat(number), decimalPrecision);

  return numbro(number).format({
    trimMantissa: false,
  });
};

export const formatNumberToPlaces = (
  number = 0,
  decimalPrecision = 8,
  options = {},
) => {
  const { trim = true, thousandSeparated = true } = options;
  number = number ? number : 0;

  if (isNaN(parseFloat(number))) {
    return number;
  }

  number = trimNumber(parseFloat(number), decimalPrecision);

  return numbro(number).format({
    trimMantissa: trim,
    mantissa: decimalPrecision,
    thousandSeparated,
  });
};

export const trimNumber = (number = 0, decimalPlaces) => {
  const currentPrecision = getDecimalPrecision(number);
  if (currentPrecision > decimalPlaces) {
    number = parseFloat(number);
    number =
      Math.floor(number * Math.pow(10, decimalPlaces)) /
      Math.pow(10, decimalPlaces);
  }

  return number;
};

export const isUUID = str => {
  const regex = new RegExp(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  );
  return regex.test(str);
};

export const isFloat = number => {
  return number === +number && number !== (number | 0);
};
// export const restrictToDecimalPlace = place => value => {
//   return formatCrypto(parseFloat(value).toFixed(place));
// }

// Taken from https://stackoverflow.com/a/27865285
export const getDecimalPrecision = number => {
  let precision = 0;
  let e = 1;

  if (!isFinite(number)) {
    return precision;
  }

  while (Math.round(e * number) / e !== number) {
    e *= 10;
    precision++;
  }

  return precision;
};

// Based on https://observablehq.com/@mbostock/localized-number-parsing
class NumberParser {
  constructor(locale) {
    this.setLocale(locale);
  }

  setLocale(locale) {
    let parts;
    if (Intl.NumberFormat.prototype.formatToParts) {
      parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    } else {
      parts = [
        {
          type: 'integer',
          value: '12',
        },
        {
          type: 'group',
          value: ',',
        },
        {
          type: 'integer',
          value: '345',
        },
        {
          type: 'decimal',
          value: '.',
        },
        {
          type: 'fraction',
          value: '6',
        },
      ];
    }
    const numerals = [
      ...new Intl.NumberFormat(locale, { useGrouping: false }).format(
        9876543210,
      ),
    ].reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));
    this.decimalSeparator = parts.find(d => d.type === 'decimal').value;
    this.thousandSeparator = parts.find(d => d.type === 'group').value;
    this._group = new RegExp(
      `[${parts.find(d => d.type === 'group').value}]`,
      'g',
    );
    this._decimal = new RegExp(
      `[${parts.find(d => d.type === 'decimal').value}]`,
    );
    this._numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    this._index = d => index.get(d);
  }

  setDelimiters({ thousandSeparator, decimalSeparator }) {
    this._decimal = new RegExp(`[${decimalSeparator}]`);
    this._group = new RegExp(`[${thousandSeparator}]`, 'g');
    this.decimalSeparator = decimalSeparator;
    this.thousandSeparator = thousandSeparator;
  }

  getDelimiters() {
    return {
      thousandSeparator: this.thousandSeparator,
      decimalSeparator: this.decimalSeparator,
    };
  }

  parse(string) {
    string = _.isNumber(string) ? string.toString() : string ? string : '0';
    // eslint-disable-next-line no-cond-assign
    return (string = string
      .trim()
      .replace(this._group, '')
      .replace(this._decimal, '.')
      .replace(this._numeral, this._index))
      ? string
      : NaN;
  }
}

export const numberParser = new NumberParser('en');

export const setNumbroLocale = () => {
  // Default numbro locale, just changing thousands and decimal delimiters.
  numbro.registerLanguage(
    {
      languageTag: 'df',
      delimiters: {
        thousands: numberParser.thousandSeparator,
        decimal: numberParser.decimalSeparator,
      },
      abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't',
      },
      spaceSeparated: false,
      ordinal: function(number) {
        let b = number % 10;
        return ~~((number % 100) / 10) === 1
          ? 'th'
          : b === 1
          ? 'st'
          : b === 2
          ? 'nd'
          : b === 3
          ? 'rd'
          : 'th';
      },
      currency: {
        symbol: '$',
        position: 'prefix',
        code: 'USD',
      },
      currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
      },
      formats: {
        fourDigits: {
          totalLength: 4,
          spaceSeparated: true,
        },
        fullWithTwoDecimals: {
          output: 'currency',
          thousandSeparated: true,
          mantissa: 2,
        },
        fullWithTwoDecimalsNoCurrency: {
          thousandSeparated: true,
          mantissa: 2,
        },
        fullWithNoDecimals: {
          output: 'currency',
          thousandSeparated: true,
          mantissa: 0,
        },
      },
    },
    true,
  );
};

export const add = (x, y) => {
  return numbro(x)
    .add(y)
    .value();
};

export const subtract = (x, y) => {
  return numbro(x)
    .subtract(y)
    .value();
};

export const multiply = (x, y) => {
  return numbro(x)
    .multiply(y)
    .value();
};

export const divide = (x, y) => {
  return numbro(x)
    .divide(y)
    .value();
};

export const mathOperations = {
  add,
  subtract,
  multiply,
  divide,
};
