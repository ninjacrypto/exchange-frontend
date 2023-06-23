import React, { forwardRef, useRef, useCallback, useEffect, useState, useImperativeHandle } from 'react';
import { get, has, set } from 'lodash';
import { useQuery } from 'react-query';
import { generatePath, Link, useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, useFormikContext } from 'formik';
import { Trans, withNamespaces } from 'react-i18next';
import * as Yup from 'yup';
import _ from 'lodash';
import { exchangeApi } from 'api';
import { PageWrap } from 'components/Containers';
import { Loading } from 'components/Loading';
import { Form, FormField, NumberInput, TextField } from 'components/Form';
import { Box, Text, Button } from 'components/Wrapped';
import { SimplexCurrencySelect } from 'pages/Simplex';
import { formatNumberToPlaces, nestedTranslate, numberParser } from 'utils';
import { BoxHeading, ConditionalWrapper } from 'components/Helpers';
import { Requires2FA } from 'containers/Requires2FA';
import { useMutation } from 'react-query';
import { useMediaQuery } from 'react-responsive';
import { triggerToast } from 'redux/actions/ui';
import instance, { authenticatedInstance } from 'api';
import { getNDWalletBalance } from 'redux/actions/NDWalletData';

const useInstaTradePairs = () => {
  return useQuery('instaTradePairs', () => exchangeApi.getInstaTradePairs(), {
    refetchInterval: 30000,
  });
};

const calculatePayment = ({ value, rate, commission }) => {
  return -(100 * value) / (rate * (commission - 100));
};

const CounterTimer = ({ estimatedData, okxEstimateInstaPrice }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (!_.isEmpty(estimatedData)) {
        const validTill = new Date(estimatedData.valid_till).getTime();
        let currentDate = new Date().getTime();
        if (validTill > currentDate) {
          let seconds = parseInt((validTill - currentDate) / 1000);
          setTimeLeft(seconds);
        } else {
          setTimeLeft(0);
          clearInterval(id);
          okxEstimateInstaPrice();
          return;
        }
      } else {
        setTimeLeft(0);
        clearInterval(id);
      }

    }, 1000);
    return () => {
      clearInterval(id)
    };
  }, [estimatedData]);

  return (
    <React.Fragment>
      {timeLeft}
    </React.Fragment>
  );
};

const InstaTradeFields = forwardRef(({ tradingPair, paymentSelect, receiveSelect, t, mgokx, isAuthenticated, getEstData }, ref) => {
  const {
    setFieldValue,
    values: { paymentAmount },
  } = useFormikContext();
  const { commission, rate, minLimit, maxLimit, paymentCurrency, receiveCurrency } = tradingPair;
  const [payAmount, setPayAmount] = useState();

  useEffect(() => {
    if (mgokx.enabled && isAuthenticated) {
      if (minLimit) {
        setFieldValue('paymentAmount', numberParser.parse(minLimit));
        setPayAmount(numberParser.parse(minLimit))
      }
    }
  }, [minLimit])

  useEffect(() => {
    if (mgokx.enabled && isAuthenticated) {
      if (paymentAmount) {
        okxEstimateInstaPrice();
      }
    }
  }, [payAmount])

  const handleValueUpdate = useCallback(
    (name, value) => {
      if (name === 'paymentAmount') {
        const subTotal = rate * value;
        const fee = (commission / 100) * subTotal;
        const total = subTotal - fee;
        setFieldValue('receiveAmount', total);
      }

      if (name === 'receiveAmount') {
        const paymentValue = calculatePayment({ value, rate, commission });
        setFieldValue('paymentAmount', paymentValue);
      }
    },
    [setFieldValue, commission, rate],
  );

  const handleChange = useCallback(
    e => {
      const {
        target: { name, value },
      } = e;
      if (!mgokx.enabled) {
        const newValue = numberParser.parse(value);
        handleValueUpdate(name, newValue);
      }
    },
    [handleValueUpdate],
  );

  const handleBlur = (e) => {
    if (mgokx.enabled) {
      if (e.target.value <= minLimit) {
        const newValue = numberParser.parse(minLimit);
        setFieldValue('paymentAmount', newValue);
        setPayAmount(newValue);
      } else if (e.target.value > minLimit) {
        const newValue = numberParser.parse(e.target.value);
        setFieldValue('paymentAmount', newValue);
        setPayAmount(newValue);
      }
    }
  }

  useImperativeHandle(ref, () => ({
    getEstimateInstaPrice() {
      okxEstimateInstaPrice();
    }
  }));

  const okxEstimateInstaPrice = async () => {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/estimate_insta_price',
        method: 'POST',
        data: {
          baseCurrency: paymentCurrency,
          quoteCurrency: receiveCurrency,
          baseAmount: paymentAmount,
        },
      });

      if (data.status === 'Success') {
        setFieldValue('receiveAmount', numberParser.parse(data.data.quote_amount));
        setFieldValue('order_id', data.data.order_id);
        setFieldValue('okx_quote_id', data.data.okx_quote_id);
        getEstData(data.data);
      } else {
        triggerToast(data.message, 'error');
        getEstData({});
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (paymentAmount) {
      handleValueUpdate('paymentAmount', paymentAmount);
    }
  }, [handleValueUpdate]);

  return (
    <Box pad="none" gap="small">
      <FormField
        name="paymentAmount"
        label={t('payment')}
        help={t('spendBetween', {
          min: minLimit,
          max: maxLimit,
          currency: paymentCurrency,
        })}
      >
        <NumberInput
          inputOnBlur={handleBlur}
          name="paymentAmount"
          addonEnd={{ content: paymentSelect, pad: 'none', width: '150px' }}
          inputOnChange={handleChange}
          margin="none"
        />
      </FormField>
      <div>
        <FormField name="receiveAmount" label={t('receive')}>
          <NumberInput
            name="receiveAmount"
            addonEnd={{ content: receiveSelect, pad: 'none', width: '150px' }}
            inputOnChange={handleChange}
            margin="none"
            disabled={mgokx.enabled ? true : false}
          />
        </FormField>
        <Text size="xsmall" margin={{ top: 'xsmall' }}>
          {t('feeText')}
        </Text>
      </div>
    </Box>
  );
});

const InstaTradeFormWrapped = ({
  t: translate,
  tradingPairsByCurrency,
  gAuthEnabled,
  isAuthenticated,
  portfolios,
  NDWalletBalance,
  mgokx,
  getNDWalletBalance
}) => {
  const t = nestedTranslate(translate, 'instaTrade');
  const { replace } = useHistory();
  const [mutate] = useMutation(values => exchangeApi.submitInstaTrade(values));
  const { currency: matchCurrency, payment: matchPayment } = useParams();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState();
  const [success, setSuccess] = useState();
  const [receiveCurrency, setReceiveCurrency] = useState(matchCurrency);
  const [paymentCurrency, setPaymentCurrency] = useState(matchPayment);
  const [tradingPair, setTradingPair] = useState({});
  const [receieveCurrenciesSelect, setReceiveCurrencies] = useState();
  const [paymentCurrenciesSelect, setPaymentCurrencies] = useState();
  const [mgOkxData, setMgOkxData] = useState();
  const childRef = useRef();

  let balances = {};

  if (!mgokx.enabled) {
    balances = {
      receiveCurrency: get(portfolios, `${receiveCurrency}.balance`, 0),
      paymentCurrency: get(portfolios, `${paymentCurrency}.balance`, 0),
    };
  }

  if (mgokx.enabled) {
    _.find(NDWalletBalance, (obj) => {
      if (obj.currency === receiveCurrency) {
        balances.receiveCurrency = obj.trading_balance;
      }
    });
    _.find(NDWalletBalance, (obj) => {
      if (obj.currency === paymentCurrency) {
        balances.paymentCurrency = obj.trading_balance;
      }
    });
  }

  const getSelectValue = value => ({ value, label: value });

  useEffect(() => {
    if (!hasInitialized) {
      const currencies = Object.keys(tradingPairsByCurrency);
      const newReceieveCurrencies = currencies
        .sort()
        .map(singleKey => getSelectValue(singleKey));
      setReceiveCurrencies(newReceieveCurrencies);

      if (!receiveCurrency) {
        setReceiveCurrency(currencies[0]);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, receiveCurrency, tradingPairsByCurrency]);

  useEffect(() => {
    if (!has(tradingPairsByCurrency, receiveCurrency)) {
      const currencies = Object.keys(tradingPairsByCurrency);

      setReceiveCurrency(currencies[0]);
    } else {
      if (receiveCurrency) {
        const currencies = Object.keys(
          tradingPairsByCurrency?.[receiveCurrency],
        );
        const newPaymentCurrencies = currencies
          .sort()
          .map(singleKey => getSelectValue(singleKey));

        setPaymentCurrencies(newPaymentCurrencies);
      }

      if (receiveCurrency && paymentCurrency) {
        const newTradingPair =
          tradingPairsByCurrency?.[receiveCurrency]?.[paymentCurrency];

        if (newTradingPair) {
          setTradingPair(newTradingPair);

          if (
            receiveCurrency !== matchCurrency ||
            paymentCurrency !== matchPayment
          ) {
            replace({
              pathname: generatePath('/insta-trade/:currency?/:payment?', {
                currency: receiveCurrency,
                payment: paymentCurrency,
              }),
            });
          }
        } else {
          setPaymentCurrency(
            Object.keys(tradingPairsByCurrency?.[receiveCurrency]).sort()[0],
          );
        }
      }

      if (receiveCurrency && !paymentCurrency) {
        const currencies = Object.keys(
          tradingPairsByCurrency?.[receiveCurrency],
        ).sort();
        const newPayment = currencies[0];
        setPaymentCurrency(newPayment);
      }
    }
  }, [receiveCurrency, paymentCurrency, replace, tradingPairsByCurrency]);

  const validationSchema = () => {
    // const additionalValidations = gAuthEnabled
    //   ? {
    //       gauth: Yup.string()
    //         .required()
    //         .length(6),
    //     }
    //   : {};

    return Yup.object().shape({
      paymentAmount: Yup.number()
        .required()
        .min(tradingPair.minLimit)
        .max(tradingPair.maxLimit),
      // ...additionalValidations,
    });
  };

  const currencyValue = calculatePayment({
    value: 1,
    rate: tradingPair?.rate,
    commission: tradingPair?.commission,
  });

  const handleSubmit = async ({ values, resetForm }) => {
    try {
      setIsSubmitting(true);
      setError();
      setSuccess();
      const submitData = {
        baseCurrency: paymentCurrency,
        quoteCurrency: receiveCurrency,
        baseAmount: values?.paymentAmount,
        // gauth: values?.gauth,
        order_id: mgokx.enabled ? values?.order_id : '',
        okx_quote_id: mgokx.enabled ? values?.okx_quote_id : '',
      };

      const data = await mutate(submitData);

      setIsSubmitting(false);

      if (data.status === 'Success') {
        resetForm();
        // setSuccess('instaTradeSuccess');
        triggerToast(data.message, 'success', 2500);
        if (mgokx.enabled) {
          setMgOkxData({});
        }
        getNDWalletBalance();
      } else if (data.status === 'Error') {
        setError(data.message);
      }
    } catch (e) { }
  };

  const getEstData = (data) => {
    setMgOkxData(data);
  }

  return (
    <ConditionalWrapper wrapper={<Requires2FA />} enableWrapper={gAuthEnabled}>
      <BoxHeading background="background-3">{t('title')}</BoxHeading>
      <Box background="background-2" gap="small">
        <Box pad="none">
          <Text>{t('estimate', { currency: receiveCurrency })}</Text>
          <Box pad="none" direction="row" align="end" gap="xsmall">
            {!mgokx.enabled && <Text size="large">{formatNumberToPlaces(currencyValue)}</Text>}
            {mgokx.enabled && <Text size="large">{formatNumberToPlaces(mgOkxData?.price)}</Text>}
            <Text>{paymentCurrency} {' '}
              {mgokx.enabled && (
                <React.Fragment>
                  ({t('timeLeft')}: {!_.isEmpty(mgOkxData) && <CounterTimer estimatedData={mgOkxData} okxEstimateInstaPrice={childRef.current.getEstimateInstaPrice}></CounterTimer>}
                  {t('sec')})
                </React.Fragment>
              )}
            </Text>
          </Box>
        </Box>
        <Box direction="row" pad="none" gap="small" align="center">
          <Text>{t('youHave')}</Text>
          {paymentCurrency && (
            <Box pad="xsmall" background="background-3">
              <Text size="xsmall">
                {formatNumberToPlaces(balances?.paymentCurrency)}{' '}
                {paymentCurrency}
              </Text>
            </Box>
          )}
          {receiveCurrency && (
            <Box pad="xsmall" background="background-3">
              <Text size="xsmall">
                {formatNumberToPlaces(balances?.receiveCurrency)}{' '}
                {receiveCurrency}
              </Text>
            </Box>
          )}
        </Box>
        <Formik
          initialValues={{
            paymentAmount: '',
            receiveAmount: '',
            order_id: '',
            okx_quote_id: ''
            // gauth: '',
          }}
          validationSchema={validationSchema()}
          onSubmit={(values, { resetForm }) =>
            handleSubmit({ values, resetForm })
          }
        >
          <Form gap="small">
            <InstaTradeFields
              ref={childRef}
              tradingPair={tradingPair}
              t={t}
              mgokx={mgokx}
              isAuthenticated={isAuthenticated}
              getEstData={getEstData}
              paymentSelect={
                <SimplexCurrencySelect
                  options={paymentCurrenciesSelect || null}
                  value={getSelectValue(paymentCurrency)}
                  onCurrencySelected={setPaymentCurrency}
                />
              }
              receiveSelect={
                <SimplexCurrencySelect
                  options={receieveCurrenciesSelect || null}
                  value={getSelectValue(receiveCurrency)}
                  onCurrencySelected={setReceiveCurrency}
                />
              }
            />
            {/* {gAuthEnabled && (
              <FormField name="gauth" label={translate('forms.common.gAuth')}>
                <TextField
                  name="gauth"
                  type="text"
                  placeholder={translate('forms.common.gAuth')}
                />
              </FormField>
            )} */}
            {error && (
              <Text color="status-error">{translate(`messages.${error}`)}</Text>
            )}
            {success && (
              <Text color="status-success">
                {translate(`messages.${success}`)}
              </Text>
            )}
            {isAuthenticated ? (
              <Button
                type="submit"
                color="primary"
                fill="horizontal"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {t('buy', { currency: receiveCurrency })}
              </Button>
            ) : (
              <Box
                pad="small"
                background="background-3"
                gap="xsmall"
                direction="row"
                justify="center"
              >
                <Text>
                  <Link to="/login">{translate('generics.login')}</Link>{' '}
                </Text>
                <Text>{translate('generics.or')}</Text>
                <Text>
                  <Link to="/signup">{translate('generics.register')}</Link>
                </Text>
              </Box>
            )}
          </Form>
        </Formik>
        {isAuthenticated && (
          <Text>
            <Trans i18nKey="instaTrade.history">
              {' '}
              <Link to="/orders/insta-trades"> </Link>
            </Trans>
          </Text>
        )}
      </Box>
    </ConditionalWrapper>
  );
};

const mapStateToProps = ({
  exchangeSettings: { currencySettings, settings: { mgokx } },
  auth: { isAuthenticated, gAuthEnabled },
  portfolio: { portfolios },
  NDWalletData: { balance }
}) => ({
  currencySettings,
  isAuthenticated,
  portfolios,
  gAuthEnabled,
  NDWalletBalance: balance,
  mgokx: mgokx,
});

const InstaTradeForm = withNamespaces()(
  connect(mapStateToProps, { getNDWalletBalance })(InstaTradeFormWrapped),
);

const InstaTrade = ({ t }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { isLoading, data } = useInstaTradePairs();

  if (isLoading) {
    return (
      <PageWrap>
        <Loading />
      </PageWrap>
    );
  }

  let tradingPairsByCurrency = {};

  data?.data.forEach(({ baseCurrency, quoteCurrency, ...rest }) => {
    const singleData = {
      receiveCurrency: quoteCurrency,
      paymentCurrency: baseCurrency,
      ...rest,
    };

    set(tradingPairsByCurrency, `${quoteCurrency}.${baseCurrency}`, singleData);
  });

  return (
    <PageWrap>
      <Box pad="none" justify="center" align="center" gap="medium">
        <Box
          pad="none"
          width={isMobile ? { max: '100%' } : '550px'}
          responsive={false}
        >
          <InstaTradeForm tradingPairsByCurrency={tradingPairsByCurrency} />
        </Box>
      </Box>
    </PageWrap>
  );
};

export default withNamespaces()(InstaTrade);
