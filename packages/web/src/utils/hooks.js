import { useEffect, useRef, useState } from 'react';
import _ from 'lodash';

// Given ref(s) will call a function if the area is clicked outside of.
// Started from https://codesandbox.io/s/py685xrnmx
// Modified to allow adding an array of refs
export const useOuterClickNotifier = (
  onOuterClick,
  innerRef,
  // Ignores Selects, and GA overlay
  ignoreClasses = [],
  ignoreIds = [],
) => {
  useEffect(() => {
    let handleClick;
    if (_.isArray(innerRef)) {
      handleClick = e => {
        let clickedInside = false;

        if (!document.contains(e.target)) {
          clickedInside = true;
        }

        innerRef.forEach(singleRef => {
          clickedInside =
            clickedInside ||
            (singleRef.current && singleRef.current.contains(e.target));
        });

        if (ignoreClasses) {
          ignoreClasses.forEach(singleClass => {
            const elements = document.querySelectorAll(
              `[class*="${singleClass}"]`,
            );
            if (elements.length) {
              elements.forEach(singleElement => {
                clickedInside =
                  clickedInside || singleElement.contains(e.target);
              });
            }
          });
        }

        if (ignoreIds) {
          ignoreIds.forEach(singleClass => {
            const elements = document.querySelectorAll(
              `[id*="${singleClass}"]`,
            );
            if (elements.length) {
              elements.forEach(singleElement => {
                clickedInside =
                  clickedInside || singleElement.contains(e.target);
              });
            }
          });
        }

        if (!clickedInside) {
          onOuterClick(e);
        }
      };

      let result = false;
      innerRef.forEach(singleRef => {
        result = result || singleRef.current;
      });
      if (result) {
        window.addEventListener('click', handleClick);
      }
    } else {
      handleClick = e => {
        innerRef.current &&
          !innerRef.current.contains(e.target) &&
          onOuterClick(e);
      };

      if (innerRef.current) {
        window.addEventListener('click', handleClick);
      }
    }

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [onOuterClick, innerRef]);
};

export const useValueFromBreakpoint = ({
  values,
  breakpoints = [768, 1366],
  defaultValue,
}) => {
  const getValue = () => {
    const currentWidth = window.innerWidth;
    let nextValueIndex = 0;

    for (const singleBreakpoint of breakpoints) {
      if (currentWidth < singleBreakpoint) {
        break;
      }
      if (values.length > nextValueIndex + 1) {
        nextValueIndex += 1;
      }
    }
    return values[nextValueIndex];
  };
  const [currentValue, setCurrentValue] = useState(
    defaultValue ? defaultValue : getValue(),
  );

  const handleResize = _.debounce(() => {
    setCurrentValue(getValue());
  }, 250);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [values, breakpoints, handleResize]);

  if (!_.isArray(values)) {
    return null;
  }

  return currentValue;
};

export const useDimmensions = () => {
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  const handleResize = _.debounce(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return {
    height,
    width,
  };
};

// From https://usehooks.com/useHover/
export const useHover = () => {
  const [value, setValue] = useState(false);

  const ref = useRef(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);

        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
    },
    [], // Recall only if ref changes
  );

  return [ref, value];
};
