import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { Box, Button, Paragraph } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';

const RequestWithdrawalCode = withNamespaces()(
  ({
    background = 'background-2',
    handleSuccess,
    requestMethod,
    messageText,
    successText,
    buttonText,
    successState,
    requestData,
    disabled,
    t,
  }) => {
    const [hasSuccess, setHasSuccess] = useState(successState);
    const [error, setError] = useState();
    const [mutate] = useMutation(
      () => {
        return requestMethod(requestData);
      },
      {
        onSuccess: data => {
          if (data.status === 'Success') {
            setHasSuccess(true);
            if (handleSuccess) {
              handleSuccess(data.data);
            }
          } else {
            setHasSuccess(false);
            setError(t(`messages.${data.message}`));
          }
        },
      },
    );

    useEffect(() => {
      setHasSuccess(successState);
    }, [successState]);

    return (
      <Box
        pad="small"
        background={background}
        gap="small"
        margin={{ bottom: 'small' }}
      >
        {!hasSuccess && error && <Paragraph>{error}</Paragraph>}
        <Paragraph>{hasSuccess ? successText : messageText}</Paragraph>
        {!hasSuccess && (
          <div>
            <Button
              color="primary"
              size="small"
              type="button"
              onClick={mutate}
              disabled={disabled}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </Box>
    );
  },
);

export default RequestWithdrawalCode;
