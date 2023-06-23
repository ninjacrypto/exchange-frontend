import React, { useEffect } from 'react';
import _ from 'lodash';
import ReCAPTCHA from 'react-google-recaptcha';
import { connect } from 'react-redux';
import styled, { withTheme, css } from 'styled-components';
import { Box } from 'components/Wrapped';

// ReCaptcha adds some extra height to the iFrame after completion for some reason
// This and the state within the component is necessary to remove this
const StyledBox = styled(Box)`
  ${props =>
    props.isComplete &&
    css`
      iframe {
        max-height: 78px;
      }
    `}
`;

const Captcha = ({ onChange, reCaptchaKey, theme: { dark } }) => {
  const [captchaComplete, setComplete] = React.useState();
  const [hasCaptcha, setHasCaptcha] = React.useState(false);

  useEffect(() => {
    if (!_.startsWith(reCaptchaKey, '6L')) {
      onChange(true);
    } else {
      setHasCaptcha(true);
      window.recaptchaOptions = {
        useRecaptchaNet: true,
      };
    }
  }, [reCaptchaKey, onChange]);

  const handleChange = data => {
    if (data) {
      setComplete(true);
    } else {
      setComplete(false);
    }
    onChange(data);
  };

  if (!hasCaptcha) {
    return null;
  }

  return (
    <StyledBox
      justify="center"
      align="center"
      margin={{ bottom: '20px' }}
      isComplete={captchaComplete}
    >
      <ReCAPTCHA
        sitekey={reCaptchaKey}
        onChange={handleChange}
        theme={dark ? 'dark' : 'light'}
      />
    </StyledBox>
  );
};

const mapStateToProps = ({
  exchangeSettings: {
    settings: {
      seo: { reCaptchaKey },
    },
  },
}) => ({ reCaptchaKey });

export default withTheme(connect(mapStateToProps)(Captcha));
