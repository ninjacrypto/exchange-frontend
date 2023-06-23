import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';

import { Box, Paragraph } from 'components/Wrapped';
import { nestedTranslate } from 'utils/strings';

class Copyright extends Component {
  render() {
    const { t: translate, exchangeName } = this.props;
    const t = nestedTranslate(translate, 'footer.copyright');
    const year = new Date().getFullYear();

    return (
      <Box align="center" pad="small">
        <Paragraph>
          {t('company', { year, exchangeName })}
        </Paragraph>
        <Paragraph>{t('rights')}</Paragraph>
      </Box>
    );
  }
}

export default withNamespaces()(Copyright);
