import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Loading } from 'components/Loading';
import { socket } from 'realtime';
import { WalletTable } from 'containers/Tables';
import { withNamespaces } from 'react-i18next';
import { Heading, Message } from 'components/Wrapped';
import { WithdrawalLimit } from 'containers/WithdrawalLimit';
import { TotalBalConverter } from 'containers/TotalBalConverter';

class WalletOverview extends Component {
  componentDidMount() {
    socket.unsubscribe('BL');
    socket.subscribe('BL');
  }
  render() {
    const {
      t,
      isLoading,
      walletTotals: { btcTotal, fiatTotal },
      enableCryptoFeatures,
      hideBalances,
    } = this.props;

    return !isLoading ? (
      <React.Fragment>
        {!_.isEmpty(fiatTotal) && (
          <Message background="background-4">
            <Heading level={4}>{t('wallet.overview.portfolio')}</Heading>
            <Heading level={3}>
                  {enableCryptoFeatures ? (
                    <React.Fragment>
                      {hideBalances ? (
                        '********'
                      ) : (
                        <React.Fragment>
                          <TotalBalConverter isFiat={false} />{` BTC / `}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  ) : (
                    ''
                  )}

                  {hideBalances ? (
                    '********'
                  ) : (
                    <React.Fragment>
                      <TotalBalConverter isFiat={true} />
                    </React.Fragment>
                  )}
                </Heading>

            <WithdrawalLimit />
          </Message>
        )}
        <WalletTable />
      </React.Fragment>
    ) : (
      <Loading />
    );
  }
}

const mapStateToProps = ({
  portfolio,
  exchangeSettings: {
    settings: { enableCryptoFeatures },
  },
  userSettings: { hideBalances },
}) => ({
  isLoading: portfolio.isLoading,
  portfolios: portfolio.portfolios,
  walletTotals: portfolio.walletTotals,
  enableCryptoFeatures,
  hideBalances,
});

export default withNamespaces()(connect(mapStateToProps)(WalletOverview));
