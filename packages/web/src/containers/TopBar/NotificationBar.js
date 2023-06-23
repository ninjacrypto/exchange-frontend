import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';

import { clearNotification } from 'redux/actions/ui';
import { Box, Paragraph } from 'components/Wrapped';
import { Close } from 'grommet-icons';

const NotificationBar = ({
  currentNotification,
  clearedNotification,
  clearNotification,
}) => {
  const hasNotification = !!currentNotification;
  const isNotificationCleared = isEqual(
    currentNotification,
    clearedNotification,
  );

  if (!hasNotification || isNotificationCleared) {
    return null;
  }

  const handleClick = () => {
    clearNotification(currentNotification);
  };

  return (
    <Box
      pad="small"
      background="cookieConsentBackground"
      direction="row"
      justify="between"
      round={false}
      onClick={handleClick}
    >
      <Paragraph>{currentNotification}</Paragraph>
      <Close />
    </Box>
  );
};

const mapStateToProps = ({
  exchangeSettings: {
    settings: { currentNotification },
  },
  ui: { clearedNotification },
}) => ({ currentNotification, clearedNotification });

export default connect(mapStateToProps, { clearNotification })(NotificationBar);
