import React from 'react';
import { FastField, Field, ErrorMessage } from 'formik';
import PropTypes from 'prop-types';
import styles from './Form.module.scss';
import classNames from 'classnames';

const FieldGroup = ({
  label,
  type,
  name,
  placeholder,
  fieldStyles,
  icon,
  iconposition,
  autoComplete,
  isFastField,
  help
}) => {
  icon = icon ? `url(${icon})` : '';
  iconposition = iconposition ? styles[`icon${iconposition}`] : '';

  const FieldType = isFastField ? FastField : Field;

  return (
    <div className={classNames('field', fieldStyles)}>
      {label && <label className="label">{label}</label>}
      <FieldType
        type={type}
        name={name}
        className={classNames(styles.input, iconposition)}
        placeholder={placeholder}
        style={{ backgroundImage: icon }}
        iconposition={iconposition}
        autoComplete={autoComplete} // ? Does this even work
      />
      { help && <p className="help">{help}</p> }
      <ErrorMessage
        name={name}
        component="div"
        className={styles.errorMessage}
      />
    </div>
  );
};

FieldGroup.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.string,
  iconposition: PropTypes.string,
  fieldStyles: PropTypes.string,
  autoComplete: PropTypes.string,
  isFastField: PropTypes.bool,
  help: PropTypes.node,
};

FieldGroup.defaultProps = {
  isFastField: false,
};

export default FieldGroup;
