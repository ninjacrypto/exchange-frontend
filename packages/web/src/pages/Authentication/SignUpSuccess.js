import React from 'react';
import { withNamespaces } from 'react-i18next';

import { Box, Heading, Paragraph } from 'components/Wrapped';

class SignupSuccess extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { t } = this.props;

    return (
      <Box>
        <Heading level={2}>
          {t('forms.signUp.success.heading')}
        </Heading>
        <Paragraph>
          {t('forms.signUp.success.message')}
        </Paragraph>
      </Box>
    )
  }
}

export default withNamespaces()(SignupSuccess);