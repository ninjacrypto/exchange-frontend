import React, { useState } from 'react';
import {
    clamp,
    clone,
    isFunction,
    isUndefined,
    isEmpty
} from 'lodash';

import { nestedTranslate } from 'utils';
import {
    Box,
    Button,
    Message
} from 'components/Wrapped';
import { getSocialTradeInstance } from 'api';
import { useMutation } from 'react-query';
import { Field, Form, Formik } from 'formik';
import { TextField, SelectField, DatePicker, FormField } from 'components/Form';
import moment from 'moment';
import { triggerToast } from 'redux/actions/ui';
import { Notification } from 'react-bulma-components';
import { SubscriptionTypes, AlertTypes } from './Enums';
import { composePropertyName, createOptions } from './Utils';

export const SubscriptionForm = ({
    strategyId,
    subscriptionInfo,
    t: translate,
    propertyGroup = '',
    noForm = false,
    onValidationStateChanged = isValid => { },
    onSuccess = () => { },
    onError = () => { }
}) => {

    const minAtp = 0.1;
    const maxAtp = 10;
    const t = nestedTranslate(translate, 'socialTrade');
    const [atpError, setAtpError] = useState(undefined);
    const [currentSubscriptionType, setCurrentSubscriptionType] = useState(subscriptionInfo && subscriptionInfo.subscriptionType);
    const authInstance = getSocialTradeInstance();

    const getSubscriptionInfo = () => {
        return subscriptionInfo || {
            subscriptionType: undefined,
            alertType: undefined,
            accountTradingPercentage: undefined
        };
    };

    const isSubscribed = () => subscriptionInfo && subscriptionInfo.subscriptionType !== 'None';

    const getAtp = v => {
        var n = parseFloat(v);
        return isNaN(n) ? minAtp : clamp(v, minAtp, maxAtp);
    };

    const [mutateSubscription] = useMutation(
        values => {
            return authInstance({
                url: '/api/strategy/update-subscription',
                method: 'POST',
                data: composeMutationData(values)
            });
        },
        {
            onSuccess: (rsp, values) => {
                if (onSuccess) {
                    onSuccess(rsp, values);
                }
            },
            onError: (rsp, values) => {
                if (onError) {
                    onError(rsp, values);
                }
            }
        }
    );

    const composeMutationData = (values) => {
        return {
            strategyId: strategyId,
            subscriptionType: values.subscriptionType,
            alertType: values.alertType,
            accountTradingPercentage: getAtp(values.accountTradingPercentage)
        };
    };

    const validateAtp = e => {
        var v = e.target.value;
        if (isUndefined(v) || isEmpty(v)) {
            setAtpError(undefined);
            onValidationStateChanged(true);
            return;
        }

        var n = parseFloat(v);
        if (isNaN(n)) {
            setAtpError(t('error_invalid_atp'));
            onValidationStateChanged(false);
            return;
        }

        if (n > maxAtp || n < minAtp) {
            setAtpError(t('error_invalid_atp_range') + `${minAtp} - ${maxAtp}.`);
            onValidationStateChanged(false);
        } else {
            setAtpError(undefined);
            onValidationStateChanged(true);
        }
    };

    const renderFields = () => {
        return (
            <div>
                <FormField name={composePropertyName("subscriptionType", propertyGroup)} label={t('subscriptionType')}>
                    <Field
                        name={composePropertyName("subscriptionType", propertyGroup)}
                        component={SelectField}
                        options={createOptions(SubscriptionTypes, t, "subscriptionTypes")}
                        persistentPlaceholder={false}
                        afterChange={({ value }) => setCurrentSubscriptionType(value)} />
                </FormField>
                {
                    currentSubscriptionType === SubscriptionTypes.Alert && (
                        <FormField name={composePropertyName("alertType", propertyGroup)} label={t('alertType')}>
                            <Field
                                name={composePropertyName("alertType", propertyGroup)}
                                component={SelectField}
                                options={createOptions(AlertTypes, t, "alertTypes")}
                                persistentPlaceholder={false} />
                        </FormField>
                    )
                }
                {
                    currentSubscriptionType === SubscriptionTypes.AutoTrade && (
                        <Box pad="none">
                            <Notification color="warning">
                                <strong>{t('autoTradeWarning')}</strong>
                            </Notification>
                            <FormField name={composePropertyName("accountTradingPercentage", propertyGroup)} label={t('accountTradingPercentage')}>
                                <TextField
                                    type="text"
                                    name={composePropertyName("accountTradingPercentage", propertyGroup)}
                                    placeholder={t('accountTradingPercentage')}
                                    persistentPlaceholder={false}
                                    onKeyUp={validateAtp}
                                />
                            </FormField>
                            {atpError && (
                                <Notification color="danger">
                                    <span>{atpError}</span>
                                </Notification>
                            )}
                        </Box>
                    )
                }
                {
                    !noForm && (
                        <Box
                            direction="row"
                            justify="end">
                            <Button
                                type="submit">
                                {isSubscribed()
                                    ? translate('buttons.accept')
                                    : t('subscribe')}
                            </Button>
                            {isSubscribed() && (
                                <Button
                                    type="button"
                                    margin={{ left: 'small' }}
                                    onClick={() => {
                                        if (!atpError) {
                                            mutateSubscription({ subscriptionType: 'None' });
                                        }
                                    }}>
                                    {t('unsubscribe')}
                                </Button>
                            )}
                        </Box>
                    )
                }
            </div>
        )
    };

    return (
        noForm
            ? renderFields()
            : (
                <Formik
                    enableReinitialize={true}
                    initialValues={getSubscriptionInfo()}
                    onSubmit={values => {
                        if (!atpError) {
                            mutateSubscription(values);
                        }
                    }}
                >
                    {
                        props => (
                            <Form>
                                {renderFields()}
                            </Form>
                        )
                    }
                </Formik>
            )
    );
};

export const BacktestForm = ({
    baseCurrency,
    quoteCurrency,
    script,
    t: translate,
    callback
}) => {

    const t = nestedTranslate(translate, "socialTrade");
    const tMsg = nestedTranslate(translate, "messages");
    const authInstance = getSocialTradeInstance();

    const [runBacktest] = useMutation(
        values => {
            var data = clone(values);
            data.timestamp = moment(values.timestamp).valueOf();
            return authInstance({
                url: '/api/backtest/run',
                method: 'POST',
                data: data
            });
        },
        {
            onSuccess: rsp => {
                if (rsp.status === true) {
                    if (isFunction(callback)) {
                        callback(rsp.data);
                    }
                } else {
                    triggerToast(rsp.message, "error");
                }
            },
            onError: rsp => {
                console.log(rsp);
                triggerToast(tMsg('Request_Invalid'), "error");
            }
        }
    );

    return (
        <Formik
            enableReinitialize={true}
            initialValues={{
                baseCurrency: baseCurrency,
                quoteCurrency: quoteCurrency,
                script: script,
                useBuySignal: true,
                useSellSignal: true,
                slipPct: 0.0001,
                interval: 60,
                limit: 250,
                timestamp: moment().valueOf()
            }}
            onSubmit={values => runBacktest(values)}>
            {
                props => (
                    <Form>
                        <Box>
                            <FormField name="slipPct" label={t('slipPct')}>
                                <TextField
                                    type="float"
                                    name="slipPct"
                                    placeholder={t('slipPct')}
                                    persistentPlaceholder={false} />
                            </FormField>
                            <FormField name="interval" label={t('interval')}>
                                <Field
                                    name="interval"
                                    component={SelectField}
                                    options={[
                                        { value: 60, label: '60 min' }
                                    ]}
                                    persistentPlaceholder={false}
                                />
                            </FormField>
                            <FormField name="limit" label={t('limit')}>
                                <Field
                                    name="limit"
                                    component={SelectField}
                                    options={[
                                        { value: 250, label: '250 items' }
                                    ]}
                                    persistentPlaceholder={false}
                                />
                            </FormField>
                            <DatePicker
                                type="date"
                                name="timestamp"
                                label={t('tillDate')}
                                placeholder={t('tillDate')}
                            />
                            {
                                (!baseCurrency || !quoteCurrency || !script)
                                    ? (
                                        <Message background="background-4" margin={{ bottom: 'small' }}>
                                            {t('backtestBaseFieldsRequired')}
                                        </Message>
                                    )
                                    : (
                                        <Box
                                            direction="row"
                                            justify="end">
                                            <Button
                                                type="submit">
                                                {t('run')}
                                            </Button>
                                        </Box>
                                    )
                            }
                        </Box>
                    </Form>
                )
            }
        </Formik>
    );
};