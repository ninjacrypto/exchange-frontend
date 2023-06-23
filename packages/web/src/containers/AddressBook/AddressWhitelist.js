import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, queryCache } from 'react-query';
import { exchangeApi } from 'api';
import { CheckBox, Paragraph, Box } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';

export const useAddressWhitelistStatus = () => {
  return useQuery('addressWhitelistStatus', () =>
    exchangeApi.getAddressWhitelistStatus(),
  );
};

export const AddressWhitelist = withNamespaces()(({ t: translate }) => {
  const t = nestedTranslate(translate, 'wallet.addressBook');

  return (
    <Box direction="row" justify="between" background="background-2">
      <Paragraph>{t('whitelistDescription')}</Paragraph>
      <AddressWhitelistControl enableLabel={true} />
    </Box>
  );
});

export const AddressWhitelistControl = withNamespaces()(({ t }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { data } = useAddressWhitelistStatus();
  const [mutate] = useMutation(
    () => {
      setIsEnabled(!isEnabled);
      exchangeApi.setAddressWhitelistStatus(!isEnabled);
    },
    {
      onSuccess: () => {
        setIsEnabled(!isEnabled);
        queryCache.invalidateQueries('addressWhitelistStatus');
      },
    },
  );

  useEffect(() => {
    if (data?.status === 'Success') {
      setIsEnabled(data.data);
    }
  }, [data]);

  return (
    <CheckBox
      checked={isEnabled}
      toggle={true}
      onChange={mutate}
      label={t(`generics.${isEnabled ? 'enabled' : 'disabled'}`)}
    />
  );
});
