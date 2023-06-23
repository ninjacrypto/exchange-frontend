import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import cx from 'classnames';
import styles from './Loading.module.scss';

const Loading = ({ fullVh, size, color, type }) => (
  <div
    className={cx(styles.loadingContainer, {
      [styles.fullVh]: fullVh ? fullVh : '',
    })}
  >
    <Loader type={type} color={color} height={size} width={size} />
  </div>
);

Loading.propTypes = {
  fullVh: PropTypes.bool,
  size: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.string,
};

Loading.defaultProps = {
  size: '50',
  color: 'var(--loadingColor)',
  type: 'Triangle',
}

export default Loading;
