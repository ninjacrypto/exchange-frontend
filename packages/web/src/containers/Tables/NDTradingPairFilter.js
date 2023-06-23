import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { SearchSelect } from 'components/Wrapped';

const NDTradingPairFilter = ({
  setTradingPair,
  defaultValue: initialValue,
  tradingPairs,
}) => {

  const [options, setOptions] = useState([]);
  let isTradePage = window.location.pathname.startsWith("/trade");

  useEffect(() => {
    let newOptions = _.sortBy(
      tradingPairs.map(tradingPair => ({
        label: `${tradingPair.baseCurrency}/${tradingPair.quoteCurrency}`,
        value: tradingPair,
      })),
      ['label'],
    );

    if (newOptions.length) {
      newOptions.unshift({ value: 'ALL', label: 'All' });
    }

    setOptions(newOptions);
  }, [tradingPairs]);

  const defaultValue = _.find(options, { value: initialValue });

  return (
    <React.Fragment>
    {!isTradePage &&
      <SearchSelect
        options={options}
        afterSelect={({ value }) => setTradingPair(value)}
        defaultValue={defaultValue}
        valueKey="value"
        labelKey="label"
      />
    }
    </React.Fragment>
  );
};

const mapStateToProps = ({ NDWalletData: { tradingPairs } }) => ({ tradingPairs });

export default connect(mapStateToProps)(NDTradingPairFilter);
