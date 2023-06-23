import React from 'react';

export const ConditionalWrapper = ({ wrapper, children, enableWrapper }) => {
  if (!enableWrapper) {
    return children;
  }

  return React.cloneElement(wrapper, { children });
};
