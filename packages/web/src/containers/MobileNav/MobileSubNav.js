import React, { useState, useEffect } from 'react';
import { NavbarItem } from 'components/Navbar';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Menu, Text, Box } from 'components/Wrapped';
import { FormDown, FormUp } from 'grommet-icons';

const MobileSubNav = ({ t, subNavData: { heading, subs } }) => {
  const [isClosed, setIsClosed] = useState(true);

  return (
    <React.Fragment>
      <Box pad="none">
        <Box pad="medium" direction="row" fill="horizontal" justify="between" onClick={()=> setIsClosed(!isClosed)}>
          <Box pad="none" fill="horizontal">
            <Text size="medium">{heading}</Text>
          </Box>
          <Box pad="none" justify="center">
            {isClosed && <FormDown size="18px" />}
            {!isClosed && <FormUp size="18px" />}
          </Box>
        </Box>
        {!isClosed && (
        <Box pad={{ horizontal: 'medium', vertical: 'small' }} background="background-3">
          {subs.map((item, index) => (
            <Box pad="none" key={index}>
              <Text margin={{bottom: 'small'}} onClick={item.onClick}>{item.heading}</Text>
            </Box>
          ))}
        </Box>
        )}
      </Box>
    </React.Fragment>
  );
};

const mapStateToProps = ({
  markets: {
    rateList: { fiat },
  },
  exchangeSettings: {
    currencyCode,
    settings: { fiatList },
  },
}) => ({
  currencyCode,
  fiat,
  fiatList,
});

export default withRouter(withNamespaces()(MobileSubNav));
