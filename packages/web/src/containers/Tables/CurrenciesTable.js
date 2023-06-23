import * as React from 'react';
import { connect } from 'react-redux';
import { normalizeColor } from 'grommet/utils';
import { useTheme } from 'styled-components';

import { CryptoIcon } from 'components/CryptoIcon';
import { formatNumberToPlaces } from 'utils';
import { TableWrapper } from 'containers/Tables';

import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils/strings';
import { PrettyPercent } from 'components/Helpers';
import { FiatConverter } from 'containers/FiatConverter';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

const Sparkline = ({ data, color = 'primary' }) => {
  const theme = useTheme();
  const colorHex = normalizeColor(color, theme);
  if (!data) {
    return null;
  }

  const chartData = data.map((value, i) => ({ x: i, y: value }));

  return (
    <ResponsiveContainer>
      <LineChart data={chartData}>
        <YAxis hide={true} dataKey="y" domain={['dataMin', 'dataMax']} />
        <Line type="monotone" dataKey="y" dot={false} stroke={colorHex} />
      </LineChart>
    </ResponsiveContainer>
  );
};

class Currencies extends React.Component {
  render() {
    const { t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.currenciesTable');
    const tableData = Object.values(this.props.currencies);

    return (
      <TableWrapper
        key={this.props.time}
        data={tableData}
        isFilterable={true}
        filterBy={['coinName', 'symbol']}
        columns={[
          {
            Header: t('rank'),
            accessor: 'rank',
            sortMethod: (a, b) => {
              a = a === null || a === undefined ? 9999 : a;
              b = b === null || b === undefined ? 9999 : b;

              return a - b;
            },
            minWidth: 50,
            show: false,
          },
          {
            accessor: 'symbol',
            show: false,
          },
          {
            Header: t('name'),
            accessor: 'coinName',
            Cell: ({ value, original: { symbol } }) => {
              return (
                <div>
                  <CryptoIcon currency={symbol} />
                  {symbol} - {value}
                </div>
              );
            },
          },
          {
            Header: t('price'),
            id: 'price',
            accessor: ({ price }) => Number(price),
            Cell: ({ value }) =>
              value ? (
                <FiatConverter
                  currency="USD"
                  walletBalance={value}
                  returnValue={true}
                />
              ) : (
                '-'
              ),
          },
          {
            Header: t('marketCap'),
            id: 'marketCap',
            accessor: ({ marketCap }) => Number(marketCap),
            Cell: ({ value }) =>
              value ? (
                <FiatConverter
                  currency="USD"
                  walletBalance={value}
                  returnValue={true}
                />
              ) : (
                '-'
              ),
          },
          {
            Header: t('circulatingSupply'),
            id: 'circulatingSupply',
            accessor: ({ circulatingSupply }) => Number(circulatingSupply),
            Cell: ({ value, original: { symbol } }) =>
              `${formatNumberToPlaces(value, 0)} ${symbol}`,
          },
          {
            Header: t('change24h'),
            id: 'priceChangePercent24hr',
            accessor: ({ priceChangePercent24hr }) =>
              Number(priceChangePercent24hr),
            Cell: ({ value }) =>
              value ? <PrettyPercent value={value} /> : '-',
            maxWidth: 100,
          },
          {
            accessor: 'sparklineGraph',
            Cell: ({ value }) => <Sparkline data={value} />,
            maxWidth: 150,
          },
        ]}
        defaultSorted={[
          {
            id: 'marketCap',
            desc: true,
          },
        ]}
        getTrProps={(state, rowInfo) => ({
          onClick: () => {
            this.props.history.push(
              `/currencies/${rowInfo.original.exchangeTicker}`,
            );
          },
        })}
        minRows={3}
        pageSize={tableData.length}
        showPagination={false}
      />
    );
  }
}

const mapStateToProps = ({ currencyData }) => ({
  currencies: currencyData.currencies,
});

export default withNamespaces()(
  connect(mapStateToProps)(Currencies),
);
