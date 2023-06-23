import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Template } from 'grommet-icons';

import { nestedTranslate, useOuterClickNotifier } from 'utils';
import {
  updateLayoutPreference,
  updateExchangeLayouts,
} from 'redux/actions/userSettings';
import { usePopper, Tooltip } from 'components/Tooltip/Popper';
import { Box, Text, CheckBox, Paragraph } from 'components/Wrapped';

const LayoutPreference = ({
  layoutPreference,
  updateExchangeLayouts,
  updateLayoutPreference,
  t: translate,
}) => {
  const [isOpen, setOpen] = useState(false);
  const t = nestedTranslate(translate, 'layoutOptions');
  const enableCustomLayouts = layoutPreference === 'pro';

  const { reference, popper } = usePopper();

  useOuterClickNotifier(() => {
    if (isOpen) {
      setOpen(false);
    }
  }, [reference, popper]);

  const handleToggle = () => {
    updateLayoutPreference(enableCustomLayouts ? 'classic' : 'pro');
  };

  const resetLayouts = () => {
    updateExchangeLayouts({});
  };

  return (
    <React.Fragment>
      <Box
        pad={{ horizontal: 'small' }}
        onClick={() => setOpen(!isOpen)}
        forwardRef={reference}
        justify="center"
      >
        <Template />
      </Box>
      <Tooltip
        forwardRef={popper}
        hidden={!isOpen}
        background="background-3"
        width="medium"
      >
        <Box gap="small">
          <CheckBox
            label={<Text>{t('customLayouts')}</Text>}
            checked={enableCustomLayouts}
            onChange={handleToggle}
          />
          <Paragraph>{t('info')}</Paragraph>
          {enableCustomLayouts && (
            <Text
              onClick={resetLayouts}
              hoverColor="primary"
              style={{ cursor: 'pointer' }}
            >
              {t('reset')}
            </Text>
          )}
        </Box>
      </Tooltip>
    </React.Fragment>
  );
};

const mapStateToProps = ({ userSettings: { layoutPreference } }) => ({
  layoutPreference,
});

export default withNamespaces()(
  connect(mapStateToProps, {
    updateLayoutPreference,
    updateExchangeLayouts,
  })(LayoutPreference),
);
