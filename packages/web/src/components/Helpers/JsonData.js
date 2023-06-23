import React from 'react';
import PropTypes from 'prop-types';

const JsonData = ({ data }) => <pre>{JSON.stringify(data, null, 2)}</pre>;

JsonData.propTypes = {
  data: PropTypes.any,
};

export default JsonData;
