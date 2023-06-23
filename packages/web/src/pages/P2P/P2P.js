import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { triggerModalOpen } from 'redux/actions/ui';
import { P2PTabs } from 'pages/P2P';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import {
  Offers,
  PostOffer,
  PaymentSettings,
  MyOffers,
  MyOrders,
  OfferEdit,
  OrderDetails,
  P2PWallet,
} from 'pages/P2P';
import { RestrictedRoutes } from 'components/RestrictedRoutes';
import {
  getP2PCurrencies,
  getPaymentMethods,
  getUserPaymentMethods,
  getMyOffers,
} from 'redux/actions/p2p';

class P2P extends React.Component {
  state = {};

  componentDidMount() {
    const { isAuthenticated, getUserPaymentMethods } = this.props;
    if (isAuthenticated) {
      getUserPaymentMethods();
    }
  }

  render() {
    return (
      <React.Fragment>
        <Switch>
          <Route path="/p2p" component={Offers} exact={true} />
          <RestrictedRoutes
            path="/p2p/payment-settings"
            component={PaymentSettings}
            exact={true}
          />
          <RestrictedRoutes
            path="/p2p/post-offer"
            component={PostOffer}
            exact={true}
          />
          <RestrictedRoutes
            path="/p2p/my-offers"
            component={MyOffers}
            exact={true}
          />
          <RestrictedRoutes
            path="/p2p/my-orders"
            component={MyOrders}
            exact={true}
          />
          <RestrictedRoutes
            path="/p2p/offer-edit/:id"
            component={OfferEdit}
            exact={true}
          />
          <RestrictedRoutes
            path="/p2p/order-details/:id"
            component={OrderDetails}
            exact={true}
          />
          <RestrictedRoutes
            path="/p2p/p2p-wallet"
            component={P2PWallet}
            exact={true}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ auth: { isAuthenticated } }) => ({
  isAuthenticated,
});

const P2PContainer = withRouter(
  withNamespaces()(connect(mapStateToProps, { getUserPaymentMethods })(P2P)),
);

export default P2PContainer;
