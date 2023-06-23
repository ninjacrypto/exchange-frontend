import React from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

import { useHover } from 'utils/hooks';
import { usePopper, Tooltip as PopperTooltip, Arrow } from './Popper';
import { Text, Box } from 'components/Wrapped';

const Tooltip = ({
  translation,
  description,
  children,
  position,
  t,
  background,
  onClick,
  tooltip,
}) => {
  const [hoverRef, isHovered] = useHover();
  const { reference, popper } = usePopper({
    placement: position,
    flipVariations: true,
  });

  return (
    <>
      <Box
        pad="none"
        round={false}
        justify="center"
        align="center"
        forwardRef={hoverRef}
        onClick={onClick}
        width="fit-content"
      >
        <Box
          pad="none"
          round={false}
          fill={true}
          justify="center"
          forwardRef={reference}
        >
          {children}
        </Box>
      </Box>
      <PopperTooltip
        forwardRef={popper}
        hidden={!isHovered}
        background={background}
      >
        {tooltip ? (
          tooltip
        ) : (
          <Text>
            {translation
              ? t(`tooltip.${translation.replace(/[.]/g, '')}`)
              : description}
          </Text>
        )}
        <Arrow background={background} data-popper-arrow />
      </PopperTooltip>
    </>
  );
};

Tooltip.propTypes = {
  translation: PropTypes.string,
  children: PropTypes.node.isRequired,
  position: PropTypes.string.isRequired,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.node,
  ]).isRequired,
};

Tooltip.defaultProps = {
  description: 'This is a tooltip',
  position: 'top',
  background: 'background-4',
};

export default withNamespaces()(Tooltip);
