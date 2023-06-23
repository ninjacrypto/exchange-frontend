import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { connect, ErrorMessage } from 'formik';
import { withNamespaces } from 'react-i18next';
import { TextInput, Box, Text } from 'components/Wrapped';
import { ReactSelect } from './SelectField';

class DatePicker extends React.Component {
  state = {
    month: '',
    day: '',
    year: '',
  };

  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
  };

  handleChange() {
    const { month, day, year } = this.state;

    if (month && day && year) {
      const { formik, name } = this.props;
      const date = moment.utc(`${year}-${month}-${day}`, ['YYYY-M-D'], true);

      if (date.isValid()) {
        // Backend requires this as format for dates
        formik.setFieldTouched(name);
        formik.setFieldValue(name, date.toISOString(), true);
      } else {
        const { t } = this.props;

        formik.setFieldValue(name, '');
        formik.setFieldError(name, t('forms.validations.invalidDate'));
        formik.setFieldTouched(name, true, false);
      }
    }
  }

  handlePartialChange = type => e => {
    const { value } = e.target;
    this.setState({ [type]: value }, this.handleChange);
  };

  handleMonthChange = ({ value }) => {
    const month = value.toString();
    this.setState({ month: month }, this.handleChange);
  };

  componentDidMount() {
    const { name } = this.props;
    const path = `formik.values.${name}`;
    const dateData = _.get(this.props, path)
    let months = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12
    };

    if (_.get(this.props, path) !== '' && _.get(this.props, path) !== null && _.get(this.props, path) !== undefined) {
      const dateString = new Date(dateData).toString();
      const newDate = moment(new Date(dateString.substr(0, 16))).locale('en');
      const formatedNewDate = newDate.format("DD-MMM-YYYY").split('-');
      const month = months[formatedNewDate[1]];
      this.setState({ day: formatedNewDate[0], year: formatedNewDate[2], month: month });
    }
  }

  render() {
    const { label, t, name, formik } = this.props;
 
    const hasErrors = _.get(formik.touched, name) && _.get(formik.errors, name);

    const selectOptions = [
      {
        value: 0,
        label: t('forms.common.month'),
      },
      ...moment.months().map((singleMonth, i) => ({
        value: i + 1,
        label: singleMonth,
      })),
    ];

    
    const selectedOption = [];
      selectOptions.map((singleMonth) => {
        if (singleMonth.value == this.state.month) {
          const temp = {
              value: singleMonth.value,
              label: singleMonth.label,
          }
          selectedOption.push(temp);
        }
      });

    return (
      <Box pad="none">
        <Text size="medium" weight="bold">
          {label}
        </Text>
        <Box pad="none" direction="row" gap="small">
          <Box pad="none" fill={true}>
            <ReactSelect
              options={selectOptions}
              onChange={this.handleMonthChange}
              background="transparent"
              borderColor="border-1"
              value={selectedOption}
            />
          </Box>
          <TextInput
            onChange={this.handlePartialChange('day')}
            type="text"
            placeholder={t('forms.common.day')}
            value={this.state.day}
            color={hasErrors && 'danger'}
          />
          <TextInput
            onChange={this.handlePartialChange('year')}
            type="text"
            placeholder={t('forms.common.year')}
            value={this.state.year}
            color={hasErrors && 'danger'}
          />
        </Box>
        <Box pad={{ horizontal: 'small' }} align="start"  style={{marginTop:"-28px", marginBottom:"10px", padding: "0px 12px"}}>
          <Text color="status-error" size="xsmall">
            <ErrorMessage name={name} />
          </Text>
        </Box>
      </Box>
    );
  }
}

export default withNamespaces()(connect(DatePicker));
