import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';

import { Box, Text } from 'components/Wrapped';
import { AnalyticsContainer, NavCoinPicker } from 'containers/TopBar';
import { TabletUp } from 'components/Responsive';

import { useQuery, useMutation, queryCache } from 'react-query';
import { withNamespaces } from 'react-i18next';
import LayoutPreference from './LayoutPreference';
import { exchangeApi } from 'api';
import Marquee from "react-fast-marquee";
export const useAddressBook = () => {
  return useQuery('addressBook', () => exchangeApi.getCryptoRateList());
};
let currency = [];
const SkinnyBar = ({ t }) => {
  const { isLoading, data, error } = useAddressBook();

    if (data !== undefined) {
     currency = data?.data.rateList;
  }
  var altRow = false;
  return (
    <TabletUp>
      
      <Marquee gradientColor={255, 255, 255, 0} speed = {40}>
      {currency.map((entry, index) => (
<>
{/* style ="background-color:@(altRow ? "#fff" : "#E0EBEB"); height:40px;width:100px;" */}
{ entry.rate !== 0 && entry.currency !== 'USD' && index % 2 === 0 &&
  <Text >
    <span style={{paddingRight: '20px', fontWeight: 'bold', color: 'green'}}>
    {entry.currency} &nbsp; ${entry.rate.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
    </span>
  </Text>
  }
  { entry.rate !== 0 && entry.currency !== 'USD' && index % 2 !== 0 &&
  <Text >
    <span style={{paddingRight: '20px', fontWeight: 'bold', color: 'red'}}>
    {entry.currency} &nbsp; ${entry.rate.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
    </span>
  </Text>
  }
  </>
   ))}
</Marquee>

  <Box
    pad={{
      horizontal: 'small',
    }}
    round={false}
    direction="row"
    justify="end"
    wrap={true}
    background="skinnyBarBackground"
    flex={false}
    height="50px"
  >
    <Box
      pad="none"
      round={false}
      alignSelf="start"
      align="center"
      flex="grow"
      justify="start"
      direction="row"
      fill="vertical"
    >
      <Route
        path="/"
        render={({ location }) =>
          location.pathname.includes('/trade/') && (
            <React.Fragment>
              <NavCoinPicker />
              <AnalyticsContainer />
            </React.Fragment>
          )
        }
      />
    </Box>
    <LayoutPreference />
  </Box>
</TabletUp>
  )

      };

const mapStateToProps = ({ auth }) => ({
  isAuthenticated: auth.isAuthenticated,
});

export default withNamespaces()(
  withRouter(connect(mapStateToProps)(SkinnyBar)),
);
