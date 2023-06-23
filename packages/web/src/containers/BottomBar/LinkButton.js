import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './BottomBar.module.scss';

const LinkButton = ({ to, text, icon, linkClass, iconClass }) => {
  return (
    <Link to={to} className={linkClass}>
      {icon && <img src={icon} className={iconClass} alt="" />}
      {text}
    </Link>
  );
};

LinkButton.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  linkClass: PropTypes.string.isRequired,
  iconClass: PropTypes.string.isRequired,
};

LinkButton.defaultProps = {
  linkClass: styles.appButton,
  iconClass: styles.icon,
};

export default LinkButton;
