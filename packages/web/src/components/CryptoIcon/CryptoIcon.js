import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import classNames from 'classnames';

import { Image } from 'components/Wrapped';

const StyledIcon = styled(Image)`
  border-radius: 50%;
  background-color: var(--background-5);

  ${props =>
    css`
      width: ${props.size
        ? props.theme.icon.size[props.size] || props.size
        : '25px'};
      height: ${props.size
        ? props.theme.icon.size[props.size] || props.size
        : '25px'};
    `}
`;

const CryptoIcon = ({
  iconType,
  currency,
  className,
  margin = { right: 'small' },
}) => {
  const [src, setSrc] = React.useState(
    `/assets/cryptocurrency-icons/${iconType}/${currency.toLowerCase()}.svg`,
  );
  const classes = classNames(className);

  React.useEffect(() => {
    setSrc(
      `/assets/cryptocurrency-icons/${iconType}/${currency.toLowerCase()}.svg`,
    );
  }, [currency, iconType]);

  return (
    <StyledIcon
      className={classes}
      src={src}
      key={currency}
      fallback={`/assets/cryptocurrency-icons/${iconType}/generic.svg`}
      alt={currency}
      margin={margin}
    />
  );
};

CryptoIcon.propTypes = {
  iconType: PropTypes.oneOf(['color', 'white']),
  currency: PropTypes.string.isRequired,
  className: PropTypes.string,
};

CryptoIcon.defaultProps = {
  iconType: 'color',
  className: '',
};

export default CryptoIcon;
