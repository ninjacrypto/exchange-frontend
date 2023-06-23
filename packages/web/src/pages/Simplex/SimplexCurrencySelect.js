import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { IconOption, IconValue } from 'components/Form';
import { ReactSelect } from 'components/Form/SelectField';

class SimplexCurrencySelect extends Component {
  state = {
    selectedOption: { value: '', label: '' },
  };

  static propTypes = {
    onCurrencySelected: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['fiat', 'crypto']),
  };

  handleChange = selectedOption => {
    const { onCurrencySelected, type } = this.props;
    this.setState({ selectedOption });
    onCurrencySelected(selectedOption.value, type);
  };

  render() {
    const { selectedOption } = this.state;
    const { options, name, value } = this.props;

    return (
      <React.Fragment>
        <ReactSelect
          options={options}
          onChange={this.handleChange}
          name={name}
          value={
            _.isEqual(selectedOption, { value: '', label: '' })
              ? value
              : selectedOption
          }
          components={{ Option: IconOption, SingleValue: IconValue }}
          className={'react-select-container no-margin'}
          classNamePrefix={'react-select'}
        />
      </React.Fragment>
    );
  }
}

export default SimplexCurrencySelect;
