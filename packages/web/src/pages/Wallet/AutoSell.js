import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Message, Paragraph, Select } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';

import { TableWrapper } from 'containers/Tables';
import { authenticatedInstance } from 'api';
import { triggerToast } from 'redux/actions/ui';

class AutoSell extends React.Component {
  state = {
    currencyMap: {},
    currentOptions: [],
  };

  componentDidMount() {
    this.getCurrencyMap();
    this.getCurrentOptions();
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.tradingPairs, this.props.tradingPairs)) {
      this.getCurrencyMap();
    }
  }

  getCurrentOptions = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/autosell_getlist',
        method: 'GET',
      });
      if (data.status === 'Success') {
        this.setState({ currentOptions: data.data }, () =>
          this.updateCurrencyMap(),
        );
      }
    } catch (e) {}
  };

  updateCurrencyMap() {
    const { currencyMap, currentOptions } = this.state;

    if (!_.isEmpty(currencyMap)) {
      currentOptions.forEach(
        ({ currency: baseCurrency, market: quoteCurrency }) => {
          if (currencyMap[baseCurrency]) {
            currencyMap[baseCurrency].selectedMarket = this.getOption(
              quoteCurrency,
            );
          }
        },
      );

      this.setState({
        currencyMap,
      });
    }
  }

  getCurrencyMap() {
    const { tradingPairs } = this.props;
    let currencyMap = {};

    tradingPairs.forEach(({ baseCurrency, quoteCurrency }) => {
      if (!currencyMap[baseCurrency]) {
        currencyMap[baseCurrency] = {
          baseCurrency,
          marketList: [this.getOption()],
          selectedMarket: this.getOption(),
        };
      }
      currencyMap[baseCurrency].marketList.push(this.getOption(quoteCurrency));
    });
    this.setState(
      {
        currencyMap,
      },
      () => this.updateCurrencyMap(),
    );
  }

  getOption(value = '') {
    const { t } = this.props;
    const label = value
      ? this.fullCurrency({ value })
      : t('wallet.autoSell.disabled');

    return {
      value,
      label,
    };
  }

  updateCurrency = async ({ baseCurrency, quoteCurrency, prevValue }) => {
    try {
      const url = quoteCurrency
        ? '/api/autosell_enable'
        : '/api/autosell_disable';
      const payload = {
        Currency: baseCurrency,
        Market: quoteCurrency ? quoteCurrency : prevValue,
      };
      const { data } = await authenticatedInstance({
        url,
        data: payload,
        method: 'POST',
      });
      if (data.status === 'Success') {
        this.triggerToastMessage('success');
      }
    } catch (e) {
      this.triggerToastMessage('error');
    }

    this.getCurrentOptions();
  };

  triggerToastMessage(type) {
    const { triggerToast, t } = this.props;

    triggerToast(t(`wallet.autoSell.${type}`), type);
  }

  fullCurrency = ({ value }) => {
    const { currencySettings } = this.props;
    const fullName = _.get(currencySettings, `${value}.fullName`, '');

    return `${fullName} (${value})`;
  };

  renderSell = ({
    value: { marketList, selectedMarket },
    original: { baseCurrency },
  }) => {
    return (
      <Select
        defaultValue={selectedMarket}
        options={marketList}
        onChange={({ value }) =>
          this.updateCurrency({
            baseCurrency,
            quoteCurrency: value,
            prevValue: selectedMarket.value,
          })
        }
        labelKey="label"
        valueKey="value"
      />
    );
  };

  render() {
    const { t: translate } = this.props;
    const { currencyMap } = this.state;
    const t = nestedTranslate(translate, 'wallet.autoSell');
    const tableData = Object.values(currencyMap);

    return (
      <React.Fragment>
        <Message background="background-4" margin={{ vertical: 'small' }}>
          <Paragraph>{t('description')}</Paragraph>
        </Message>
        <TableWrapper
          data={tableData}
          isFilterable={true}
          filterBy={['baseCurrency']}
          columns={[
            {
              Header: t('baseCurrency'),
              accessor: 'baseCurrency',
              Cell: this.fullCurrency,
            },
            {
              Header: t('sellTo'),
              id: 'sellTo',
              accessor: ({ marketList, selectedMarket }) => ({
                marketList,
                selectedMarket,
              }),
              Cell: this.renderSell,
            },
          ]}
          defaultSorted={[
            {
              id: 'baseCurrency',
            },
          ]}
          minRows={tableData.length || 10}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  markets: { tradingPairs },
  exchangeSettings: { currencySettings },
}) => ({
  currencySettings,
  tradingPairs,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { triggerToast },
  )(AutoSell),
);
