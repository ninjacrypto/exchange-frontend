import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from 'components/Wrapped';
import instance, { authenticatedInstance } from 'api';
import { nestedTranslate } from 'utils/strings';
import { withNamespaces } from 'react-i18next';

export const PlaidLink = withNamespaces() ( ({ t: translate, token, getBank }) => {
  const formT = nestedTranslate(translate, 'forms.fiatDepositPg');

  useEffect(() => {
   }, [])

  const addPlaidIdentity = async (payload) => {
    try {
      const { data } = await authenticatedInstance({
        url: `/checkbook/add-plaid-identity`,
        method: 'POST',
        data: payload
      });

      if (data.status === 'Success') {
      }
    } catch (e) { }
  }

  const onSuccess = useCallback(
    (token, metadata) => {
      // console.log('onSuccess', token, metadata);
      // console.log('onSuccess', JSON.stringify(token), JSON.stringify(metadata));
      addPlaidIdentity(metadata);
      setTimeout(() => {
      //window.location.reload();
      //getBank();
      window.helloComponent.reloadPage();
      }, 3000);
      
    },
    []
  );

  const onEvent = useCallback(
    (eventName, metadata) => 
    // console.log('onEvent', eventName, metadata) ,
    []
  );

  const onExit = useCallback(
    (err, metadata) => 
    // console.log('onExit', err, metadata) ,
    []
  );

  const config = {
    token: token,
    onSuccess,
    onEvent,
    onExit
    // ...
  };

  const { open, ready, error } = usePlaidLink(config);

  return (
    <Button
    type="submit"
    color="primary"
    primary={false}
    onClick={() => open()}
    disabled={!ready}
    >
      LINK ACCOUNT
  </Button>
  );
});