import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Columns, Column } from 'components/Wrapped';

const TwoCols = ({ leftCol, rightCol, hideLeftCol }) => (
  <Fragment>
    <Columns>
      {!hideLeftCol && <Column width={[1]} p={0} mb={2}>{leftCol}</Column>}
      <Column width={[1]} p={0}>{rightCol}</Column>
    </Columns>
  </Fragment>
);

TwoCols.propTypes = {
  hideLeftCol: PropTypes.bool,
  leftCol: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.node.isRequired,
  ]),
  rightCol: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.node.isRequired,
  ]),
};

export default TwoCols;
