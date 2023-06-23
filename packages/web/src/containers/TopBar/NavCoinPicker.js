import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { CoinTracker } from 'containers/CoinTracker';
import { usePopper, Tooltip, Arrow } from 'components/Tooltip/Popper';
import { Box, Text } from 'components/Wrapped';
import { Down } from 'grommet-icons';
import { useOuterClickNotifier } from 'utils';

const NavCoinPicker = ({ tradingPair, isLoading }) => {
  const { baseCurrency = '---', quoteCurrency = '---' } = tradingPair;
  const [isOpen, setIsOpen] = useState(false);
  const { reference, popper } = usePopper({
    placement: 'bottom-start',
  });

  useEffect(() => {
    setIsOpen(false);
  }, [baseCurrency, quoteCurrency]);

  useOuterClickNotifier(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [reference, popper]);

  return (
    <React.Fragment>
      <Box onClick={() => setIsOpen(!isOpen)} forwardRef={reference} pad="none">
        <Box
          pad={{ horizontal: 'small', vertical: 'xsmall' }}
          background="background-3"
          direction="row"
          gap="small"
          justify="center"
          align="center"
        >
          <Text size="medium">
            {baseCurrency}/{quoteCurrency}
          </Text>
          <Down size="16px" color="primary" />
        </Box>
      </Box>
      <Tooltip
        forwardRef={popper}
        hidden={isLoading || !isOpen}
        background="background-3"
        width={{ max: '100%' }}
      >
        <Box height={{ max: '500px' }} pad="none">
          {!isLoading && isOpen && <CoinTracker background="background-3" currentQuoteCurrency={`${quoteCurrency}`} currentBaseCurrency={`${baseCurrency}`}  />}
        </Box>
        <Arrow background="background-3" data-popper-arrow />
      </Tooltip>
    </React.Fragment>
  );
};

const mapStateToProps = ({
  exchange,
  exchangeSettings: { isSettingsLoading, isCurrencySettingsLoading },
}) => ({
  tradingPair: exchange.tradingPair,
  isLoading: isSettingsLoading || isCurrencySettingsLoading,
});

export default connect(mapStateToProps)(NavCoinPicker);
