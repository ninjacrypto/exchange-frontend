import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';

import { exchangeApi } from 'api';
import { ReactSelect } from 'components/Form/SelectField';
import { AddAddressModal } from './AddAddressForm';
import { Box } from 'components/Wrapped';

export const AddressBookSelect = ({ currency, onChange }) => {
  const { data } = useQuery('addressBook', () => exchangeApi.getAddressBook());
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (_.isArray(data?.data)) {
      const currencyAddresses = data.data
        .filter(
          ({ Currency }) => currency.toLowerCase() === Currency.toLowerCase(),
        )
        .map(addressEntry => ({
          label: `${addressEntry.Label} (${
            addressEntry.Address
          }${addressEntry.DT_Memo && `:${addressEntry.DT_Memo}`})`,
          value: addressEntry,
        }));
      setOptions(currencyAddresses);
    }
  }, [data, currency]);

  const handleChange = (value) => {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <React.Fragment>
      <Box pad="none" direction="row" flex={false}>
        <Box pad="none" flex={true}>
          <ReactSelect
            margin="none"
            options={options}
            onChange={handleChange}
          />
        </Box>
        <AddAddressModal currency={currency} />
      </Box>
    </React.Fragment>
  );
};
