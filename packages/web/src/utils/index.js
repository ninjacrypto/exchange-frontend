import * as clipboard from 'clipboard-polyfill';
import crypto from 'crypto-js';
import qs from 'qs';
import { secret } from 'setup';

import { triggerToast } from 'redux/actions/ui';
import instance from 'api';

const alphabeticalSort = (a, b) => {
  return a.localeCompare(b);
};

export const handleCopyToClipboard = address => {
  clipboard.writeText(address);
  triggerToast('clipboardCopied', 'success', 1200);
};

export const getHmacFromObject = data => {
  const encodeRegex = /%.{2}/g;
  // Different implementation in creating query string than backend
  const replaceEncoded = string =>
    string.replace(encodeRegex, value =>
      value === '%20' ? '+' : value.toLowerCase(),
    );

  const queryString = qs.stringify(data, {
    sort: alphabeticalSort,
    encoder: value => replaceEncoded(encodeURIComponent(value)),
    encodeValuesOnly: true,
  });
  const hash = crypto.HmacSHA512(queryString, secret);
  const hashString = hash.toString(crypto.enc.Hex).toUpperCase();

  return hashString;
};

export const getHmacFromQueryString = data => {
  const qsData = qs.parse(data);

  return getHmacFromObject(qsData);
};

export const getHmacFromApi = async data => {
  try {
    const response = await instance({
      method: 'POST',
      url: '/api/hmac',
      headers: {
        secret,
      },
      data,
    });

    return response.data.data.calculatedHmac;
  } catch (e) {}
};

export const isTrue = value =>
  typeof value === 'string' ? value.toLowerCase() === 'true' : value;

export const isFalse = value =>
  typeof value === 'string' ? value.toLowerCase() === 'false' : value;

export const redirectForm = formData => {
  const { $ } = window;

  $.extend({
    redirectPost: function(location, args) {
      var form = '';
      $.each(args, function(key, value) {
        value = value
          .toString()
          .split('"')
          .join('"');
        form +=
          '<input type="hidden" name="' + key + '" value="' + value + '">';
      });
      $('<form action="' + location + '" method="POST">' + form + '</form>')
        .appendTo($(document.body))
        .submit();
    },
  });

  $.redirectPost('https://checkout.simplexcc.com/payments/new', formData);
};

export * from './numbers';
export * from './strings';
export * from './hooks';
// export * from './crypto';
