// Based off of demo example in `popper-core`.
// `react-popper` has not been updated to use popper.js v2 or to use these hooks yet.
import { createPopper } from '@popperjs/core';
import { useRef, useLayoutEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { colorStyle } from 'grommet-styles';
import { Box } from 'components/Wrapped';

export const usePopper = (options = {}) => {
  const referenceRef = useRef();
  const popperRef = useRef();
  const instanceRef = useRef();

  const mergedOptions = useMemo(
    () =>
      options === null
        ? {}
        : {
            ...options,
            modifiers: [
              ...(options.modifiers || []),
              {
                name: 'arrow',
                options: {
                  padding: 5,
                },
              },
              {
                name: 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          },
    [options],
  );

  useLayoutEffect(() => {
    // popperRef.current.style.visibility = 'visible';

    const instance = createPopper(
      referenceRef.current,
      popperRef.current,
      mergedOptions,
    );

    instanceRef.current = instance;

    return () => {
      instance.destroy();
    };
  }, [mergedOptions]);

  useLayoutEffect(() => {
    instanceRef.current.setOptions(mergedOptions);
    instanceRef.current.update();
  }, [mergedOptions]);

  return {
    reference: referenceRef,
    popper: popperRef,
    instance: instanceRef,
  };
};

export const Tooltip = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px 10px;
  border-radius: 4px;
  visibility: visible;
  z-index: 10;
  ${props =>
    props.hide &&
    css`
      &[data-popper-escaped] {
        opacity: 0.5;
      }
      &[data-popper-reference-hidden] {
        opacity: 0;
      }
    `}
  &[data-popper-placement^='top'] > [data-popper-arrow] {
    bottom: -4px;
  }
  &[data-popper-placement^='right'] > [data-popper-arrow] {
    left: -4px;
  }
  &[data-popper-placement^='bottom'] > [data-popper-arrow] {
    top: -4px;
  }
  &[data-popper-placement^='left'] > [data-popper-arrow] {
    right: -4px;
  }
  [data-small] {
    display: block;
  }
  [data-small] ~ *:not([data-small]) {
    display: none;
  }
  ${props =>
    props.hidden &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
  /* ${props =>
    props.background &&
    colorStyle('background-color', props.background, props.theme)} */
`;

export const Arrow = styled.div`
  &,
  &::before {
    width: 10px;
    height: 10px;
    position: absolute;
    z-index: -1;
  }
  &::before {
    content: '';
    transform: rotate(45deg);
    ${props =>
      props.background &&
      colorStyle('background-color', props.background, props.theme)}
    top: 0;
    left: 0;
  }
`;
