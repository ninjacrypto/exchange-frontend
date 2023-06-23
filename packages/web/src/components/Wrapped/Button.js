import React from 'react';
import { Button } from 'grommet';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { Loading } from 'components/Loading';
import { Text } from 'components/Wrapped';

const StyledButton = styled(Button)`
  ${props =>
    props.round === false &&
    css`
      border-radius: 4px;
    `};
  line-height: inherit;
`;

const WrappedButton = ({
  children,
  color,
  primary,
  loading,
  size,
  ...rest
}) => (
  <StyledButton
    label={
      !loading ? (
        <Text size={size}>{children}</Text>
      ) : (
        <Loading color="var(--defaultTextColor)" size="25" type="Oval" />
      )
    }
    color={color}
    primary={
      primary
        ? primary
        : color === 'primary' && primary !== false
          ? true
          : false
    }
    {...rest}
  />
);

WrappedButton.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  primary: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.string,
  round: PropTypes.bool,
};

WrappedButton.defaultProps = {
  size: 'medium',
};

export default WrappedButton;
