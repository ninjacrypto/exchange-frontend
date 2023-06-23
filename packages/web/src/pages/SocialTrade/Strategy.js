import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { Box, TextArea } from 'grommet';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { nestedTranslate } from 'utils';
import { Field, Form, Formik } from 'formik';
import { SelectField, TextField, FormField, ExtendedFormField } from 'components/Form';
import * as Yup from 'yup';
import { Button, Modal } from 'components/Wrapped';
import { getSocialTradeInstance } from 'api';
import { useMutation, useQuery } from 'react-query';
import Axios from 'axios';
import { MultilineText } from './Controls';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { BacktestForm, SubscriptionForm } from './Forms';
import {
    AlertTypes,
    SubscriptionTypes,
    LaunchStates,
    AccessTypes,
    StrategySides
} from './Enums';
import { Columns, Notification } from 'react-bulma-components';
import StrategyPerformance from './StrategyPerformance';
import { triggerToast } from 'redux/actions/ui';
import { createOptions, createCryptoPairOptions } from './Utils';
import { map } from 'lodash';
import { getCryptoPairs } from 'redux/selectors/markets';

const Strategy = ({ location, cryptoPairsData, t: translate }) => {
    let { id } = useParams();
    const { url } = useRouteMatch();
    const history = useHistory();
    const t = nestedTranslate(translate, 'socialTrade');
    const tMsg = nestedTranslate(translate, 'messages');
    const cryptoPairs = createCryptoPairOptions(cryptoPairsData)
    const authInstance = getSocialTradeInstance();
    const syntaxCheckTimer = useRef(undefined);
    const syntaxCheckCts = Axios.CancelToken.source();
    const [syntaxError, setSyntaxError] = useState(undefined);
    const [isBacktestOpen, setIsBacktestOpen] = useState(false);
    const [performance, setPerformance] = useState(location.state && location.state.strategy.performance);
    const [strategy, setStrategy] = useState(location.state && location.state.strategy || {
        name: '',
        description: '',
        baseCurrency: cryptoPairs[0].tag.baseCurrency,
        quoteCurrency: cryptoPairs[0].tag.quoteCurrency,
        script: '',
        side: StrategySides.Buy,
        accessType: AccessTypes.Private,
        launchState: LaunchStates.Inactive,
        subscription: {
            subscriptionType: SubscriptionTypes.Alert,
            alertType: AlertTypes.Email
        },
        pair: cryptoPairs[0].value
    });
    const [subFormIsValid, setSubFormIsValid] = useState(true);

    const subFormValidationStateChanged = isValid => {
        console.log(isValid);
        setSubFormIsValid(isValid);
    };

    strategy.pair = `${strategy.baseCurrency}/${strategy.quoteCurrency}`;

    useEffect(() => {
        return () => {
            syntaxCheckCts.cancel();
            if (syntaxCheckTimer.current) {
                clearTimeout(syntaxCheckTimer.current);
            }
        };
    }, []);

    const toggleBacktest = () => setIsBacktestOpen(!isBacktestOpen);

    const isNew = () => id === "new";

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(),
        baseCurrency: Yup.string().required(),
        quoteCurrency: Yup.string().required(),
        //script: Yup.string().required(), // TODO: this is not work for text area
        accessType: Yup.string().oneOf(map(AccessTypes, (v, k) => k)),
        side: Yup.string().oneOf(map(StrategySides, (v, k) => k))
    });

    const [saveStrategy] = useMutation(
        values => {
            const httpMethod = isNew() ? 'POST' : 'PUT';
            return authInstance({
                url: '/api/strategy',
                method: httpMethod,
                data: values
            });
        },
        {
            onSuccess: (rsp, values) => {
                if (rsp.status === true) {
                    // 1. If a new strategy has been created.
                    if (isNew()) {
                        values.id = id = rsp.data.strategyId;
                        history.replace(url.replace('new', id), {
                            strategy: values
                        });
                    }
                    triggerToast(tMsg('Success_General'));
                } else {
                    triggerToast(rsp.message, "error");
                }
            },
            onError: (data) => {
                // TODO: Replace this to some error page redirect or toast with errors.                
                triggerToast(tMsg('Request_Invalid'), "error");
            }
        }
    );

    const checkScript = script => {
        if (syntaxCheckTimer.current) {
            clearTimeout(syntaxCheckTimer.current);
        }

        syntaxCheckTimer.current = setTimeout(() => {
            if (_.isEmpty(script)) {
                setSyntaxError("The 'Script' field is required.");
                return;
            }

            authInstance(
                {
                    url: '/api/strategy/val-syntax',
                    method: 'POST',
                    data: {
                        script: script
                    }
                },
                {
                    cancelToken: syntaxCheckCts.token
                }).then(rsp => {
                    if (rsp.message) {
                        setSyntaxError(rsp.message);
                    } else {
                        setSyntaxError(undefined);
                    }
                }).catch(err => {
                    //console.log(err);
                });
        }, 500);
    };

    if (!isNew() && (!location.state || !location.state.strategy)) {
        useQuery("getStrategy_" + id,
            () => authInstance({
                url: `/api/strategy?id=${id}`,
                method: 'GET'
            }),
            {
                onSuccess: (data) => {
                    if (data.status === true) {
                        setStrategy(data.data);
                        setPerformance(data.data.performance);
                    }
                }
            });
    }

    return (
        <Formik
            enableReinitialize={true}
            initialValues={strategy}
            onSubmit={values => {
                // TODO: Stub for validation.
                if (_.isEmpty(values.script)) {
                    setSyntaxError(t('error_script_field_required'));
                    return;
                }
                if (!subFormIsValid) {
                    return;
                }
                saveStrategy(values);
            }}
            validationSchema={validationSchema}>
            {
                props => (
                    <Form>
                        <Columns>
                            <Columns.Column size={8}>
                                <FormField name="name" label={t('strategyName')}>
                                    <TextField
                                        type="text"
                                        name="name"
                                        placeholder={t('strategyName')}
                                        persistentPlaceholder={false} />
                                </FormField>
                                <FormField name="side" label={t('strategySide')}>
                                    <Field
                                        name="side"
                                        component={SelectField}
                                        options={createOptions(StrategySides, t, 'strategySides')}
                                        persistentPlaceholder={false}
                                    />
                                </FormField>
                                <FormField name="accessType" label={t('accessType')}>
                                    <Field
                                        name="accessType"
                                        component={SelectField}
                                        options={createOptions(AccessTypes, t, 'accessTypes')}
                                        persistentPlaceholder={false}
                                    />
                                </FormField>
                                <Box
                                    direction="row">
                                    <FormField name="pair" label={t('tradePair')}>
                                        <Field
                                            name="pair"
                                            label="Pair (Base/Quote currencies)"
                                            component={SelectField}
                                            options={createCryptoPairOptions(cryptoPairsData)}
                                            persistentPlaceholder={false}
                                            afterChange={(e) => {
                                                props.values.quoteCurrency = e.tag.quoteCurrency;
                                                props.values.baseCurrency = e.tag.baseCurrency;
                                            }}
                                        />
                                    </FormField>
                                </Box>
                                <FormField name="description" label={t('description')}>
                                    <TextField
                                        type="text"
                                        name="description"
                                        placeholder={t('description')}
                                        persistentPlaceholder={false} />
                                </FormField>
                                <ExtendedFormField
                                    name="script"
                                    label={t('script')}
                                    labelAddonText={t('link_trade_script_docs')}
                                    labelAddonLink="https://bytedex.io/download/tradescript.pdf">
                                    <TextArea
                                        name="script"
                                        component="textarea"
                                        placeholder={t('script')}
                                        persistentPlaceholder={false}
                                        resize="vertical"
                                        onKeyUp={e => checkScript(e.target.value)}
                                    />
                                </ExtendedFormField>
                                {syntaxError && (
                                    <Box margin={{ top: 'small' }}>
                                        <Notification color="danger">
                                            <MultilineText text={syntaxError} />
                                        </Notification>
                                    </Box>
                                )}
                            </Columns.Column>
                            <Columns.Column size={4}>
                                <FormField name="launchState" label={t('launchState')}>
                                    <Field
                                        name="launchState"
                                        component={SelectField}
                                        options={createOptions(LaunchStates, t, 'launchStates')}
                                        persistentPlaceholder={false}
                                    />
                                </FormField>
                                <SubscriptionForm
                                    propertyGroup="subscription"
                                    noForm={true}
                                    subscriptionInfo={props.values.subscription}
                                    t={translate}
                                    onValidationStateChanged={subFormValidationStateChanged}
                                />
                            </Columns.Column>
                            <Columns.Column size={12}>
                                <Box
                                    direction="row"
                                    justify="end">
                                    <Button
                                        type="button"
                                        onClick={toggleBacktest}
                                        margin={{ right: 'small' }}>
                                        {t('backtest')}
                                    </Button>
                                    <Modal
                                        show={isBacktestOpen}
                                        toggleModal={toggleBacktest}
                                        width="large"
                                        pad="small">
                                        <Columns>
                                            {performance && (
                                                <Columns.Column size={5}>
                                                    <StrategyPerformance data={performance} />
                                                </Columns.Column>
                                            )}
                                            <Columns.Column size={performance ? 7 : 12}>
                                                <BacktestForm
                                                    baseCurrency={props.values.baseCurrency}
                                                    quoteCurrency={props.values.quoteCurrency}
                                                    script={props.values.script}
                                                    t={translate}
                                                    callback={data => {
                                                        setPerformance(data);
                                                        props.values.performance = data;
                                                    }}
                                                />
                                            </Columns.Column>
                                        </Columns>
                                    </Modal>
                                    {!isNew() && (
                                        <Button
                                            type="button"
                                            margin={{ right: 'small' }}
                                            onClick={() => history.push(`${url}/log`)}>
                                            {t('log')}
                                        </Button>
                                    )}
                                    <Button
                                        color="primary"
                                        type="submit">
                                        {t('save')}
                                    </Button>
                                </Box>
                            </Columns.Column>
                        </Columns>
                    </Form>
                )
            }
        </Formik>
    );
};

const mapStateToProps = (state, props) => ({
    cryptoPairsData: getCryptoPairs(state, props),
});

export default withRouter(
    withNamespaces()(connect(mapStateToProps)(Strategy)),
);