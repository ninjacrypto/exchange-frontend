import React, { useEffect } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { AuthenticationContainer } from 'pages/Authentication';
import { RegularLogin } from 'pages/Authentication';
import { TwoFactorLogin } from 'pages/Authentication';

import { nestedTranslate } from 'utils/strings';
import { RESET_TEMP_AUTH } from 'redux/reducers/auth';

const Login = ({ tempAuthToken, t: translate }) => {
  const t = nestedTranslate(translate, 'forms.login');
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch({
        type: RESET_TEMP_AUTH,
      });
    };
  }, [dispatch]);

  return (
    <AuthenticationContainer title={t('title')}>
      {!tempAuthToken ? <RegularLogin /> : <TwoFactorLogin />}
    </AuthenticationContainer>
  );
};

const mapStateToProps = ({ ui, auth }) => ({
  tempAuthToken: auth.tempAuthToken,
});

const LoginContainer = withRouter(connect(mapStateToProps, null)(Login));

export default withNamespaces()(LoginContainer);
