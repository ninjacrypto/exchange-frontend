import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Close } from 'grommet-icons';

import { Button, Box, Layer, Text } from 'components/Wrapped';

const WrappedModal = ({
  children,
  position,
  toggleModal,
  trigger,
  show,
  width = 'medium',
  heading,
  pad = 'large',
  customize = {},
  ...rest
}) => {
  const [isVisible, setShow] = React.useState();

  const toggle = () => () => {
    if (!trigger && toggleModal) {
      toggleModal();
    }
    setShow(!isVisible);
  };

  React.useEffect(() => {
    if (!trigger) {
      setShow(show);
    }
  }, [show, trigger]);

  return (
    <Fragment>
      {trigger &&
        React.cloneElement(trigger, {
          onClick: toggle(),
        })}
      {isVisible && (
        <Layer
          {...rest}
          responsive={false}
          position={position}
          onClickOutside={toggle()}
          onEsc={toggle()}
        >
          <Box background="background-2" pad="none" round={false} width={width}>
            <Box
              background="background-3"
              pad="small"
              align="center"
              justify={heading ? 'between' : 'end'}
              round={false}
              direction="row"
            >
              {heading && <Text size="medium">{heading}</Text>}
              <Button plain={true} icon={<Close />} onClick={toggle()} />
            </Box>
            <Box pad={pad} style={customize}>{children}</Box>
          </Box>
        </Layer>
      )}
    </Fragment>
  );
};

WrappedModal.propTypes = {
  children: PropTypes.node,
  trigger: PropTypes.node,
  position: PropTypes.string.isRequired,
};

WrappedModal.defaultProps = {
  position: 'center',
};

export default WrappedModal;
