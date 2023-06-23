import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import _ from 'lodash';

import { PriceChartContainer } from 'containers/PriceChart';
import { Box, Text } from 'components/Wrapped';
import { ReactSelect } from 'components/Form/SelectField';

const CurrencyPriceChart = ({ currency, tradingPairsByCurrency, t }) => {
  const tradingPairs = _.get(tradingPairsByCurrency, currency);
  const [selectOptions, setSelectOptions] = useState([]);
  const [tradingPairOption, setTradingPairOption] = useState();

  useEffect(() => {
    if (tradingPairs) {
      let newSelectItems = tradingPairs
        .filter(({ baseCurrency }) => baseCurrency === currency)
        .map(tradingPair => ({
          value: tradingPair,
          label: `${tradingPair.baseCurrency}/${tradingPair.quoteCurrency}`,
        }));
      setSelectOptions(newSelectItems);
      setTradingPairOption(newSelectItems[0]);
    }
  }, [tradingPairs, currency]);

  return (
    <Box pad="small" background="background-2">
      {tradingPairs ? (
        <>
          <Box flex={false} pad="none">
            <ReactSelect
              options={selectOptions}
              value={tradingPairOption}
              onChange={value => setTradingPairOption(value)}
              margin="none"
              background="background-4"
              menuBackground="background-4"
              borderColor="background-4"
            />
          </Box>
          <Box height="medium">
            {tradingPairOption && (
              <PriceChartContainer
                tradingPair={{
                  baseCurrency: tradingPairOption.value.baseCurrency,
                  quoteCurrency: tradingPairOption.value.quoteCurrency,
                }}
              />
            )}
          </Box>
        </>
      ) : (
        <Text>{t('priceChart.noPairs', { currency })}</Text>
      )}
    </Box>
  );
};

const mapStateToProps = ({ markets: { tradingPairsByCurrency } }) => ({
  tradingPairsByCurrency,
});

export default withNamespaces()(connect(mapStateToProps)(CurrencyPriceChart));
