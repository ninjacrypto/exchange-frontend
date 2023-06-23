import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import instance, { authenticatedInstance } from 'api';
import { ConvertFundsTable } from 'containers/Tables';
import { triggerModalOpen } from 'redux/actions/ui';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';

const ConvertFunds = ({ triggerModalOpen, t: translate }) => {
  const [currencies, setCurrencies ] = useState(false);

  useEffect(() => {
   !currencies && retrieveFundsToConvert();
  }, [currencies])

  const retrieveFundsToConvert = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: `api/convert_exchange_token`,
        method: 'GET',
      });

      if (data.status === 'Success') {
        setCurrencies(data.data);
      }
    } catch (e) { }
  }

  const convertFunds = async currencies => {
    const t = nestedTranslate(translate, 'wallet.convertFunds');

    try {
      const { data } = await instance({
        url: `api/convert_exchange_token`,
        method: 'POST',
        data: currencies,
      });

      if (data.status === 'Success') {
        triggerModalOpen(t('modalMessage'));
        retrieveFundsToConvert();
      }
    } catch (e) { }
  }

  return currencies && <ConvertFundsTable currencies={currencies} convertFunds={convertFunds} />;
}

ConvertFunds.propTypes = {
  triggerModalOpen: PropTypes.func,
  t: PropTypes.func,
}

export default withNamespaces()(connect(null, { triggerModalOpen })(ConvertFunds));


