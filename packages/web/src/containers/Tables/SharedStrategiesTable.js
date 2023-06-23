import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { TableWrapper } from 'containers/Tables';
import { nestedTranslate, trimNumber } from 'utils';
import {
    Box,
    Button,
    Modal
} from 'components/Wrapped';
import { PrettyNumberTZ } from 'components/Helpers';
import { getSocialTradeInstance } from 'api';
import { StrategyInfo, SubscriptionForm, StrategyPerformance } from 'pages/SocialTrade';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { StrategySelectors } from 'pages/SocialTrade/Enums';
import Axios from 'axios';

const SharedStrategiesTable = ({
    strategiesSelector,
    t: translate
}) => {
    const { url } = useRouteMatch();
    const history = useHistory();
    const [isSubOpen, setIsSubOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [tableData, setTableData] = useState([]);
    const t = nestedTranslate(translate, 'socialTrade');
    const authInstance = getSocialTradeInstance();

    useEffect(() => {
        let cts = Axios.CancelToken.source();
        switch (strategiesSelector) {
            case StrategySelectors.Shared:
                getTabledData('/api/strategy/shared-list?limit=1000&excludeUser=true', cts.token);
                break;
            case StrategySelectors.Subscribed:
                getTabledData('/api/strategy/shared-list?limit=1000&filter=sub_only&excludeUser=true', cts.token);
                break;
        }
        return () => {
            cts.cancel("[SharedStrategiesTable.getTabledData] Cancelling in cleanup.");
        };
    }, [strategiesSelector]);

    const getTabledData = (url, cancelToken) => {
        return authInstance({
            url: url,
            method: 'GET',
            cancelToken: cancelToken
        }).then(rsp => {
            setTableData(rsp.data);
        }).catch(err => {
            //console.log(err);
        });
    };

    const toggleSubModal = () => setIsSubOpen(!isSubOpen);

    const renderSpan = ({ value }) => {
        return (<span>{value}</span>);
    };

    const renderPair = ({ original: { baseCurrency, quoteCurrency } }) => {
        return (<span>{`${baseCurrency}/${quoteCurrency}`}</span>);
    };

    const renderDescripton = ({ value }) => {
        return (<span>{_.truncate(value)}</span>);
    };

    const renderProfit = ({ value }) => {
        return <PrettyNumberTZ number={trimNumber(value, 2)} color="bidColor" />;
    };

    const renderLoss = ({ value }) => {
        return <PrettyNumberTZ number={-trimNumber(value, 2)} color="askColor" />;
    };

    const renderActions = ({ original }) => {
        return (
            <Box
                pad="none"
                direction="row"
                justify="start"
                gap="small">
                <Button
                    size="xsmall"
                    plain={true}
                    onClick={() => handleStartModal(original, toggleSubModal)}>
                    {t(isSubscribed(original.subscription) ? 'unsubscribe' : 'subscribe')}
                </Button>
                {original.subscription && (
                    <Button
                        size="xsmall"
                        plain={true}
                        onClick={() => history.push(`${url}/${original.id}/log`)}>
                        {t('log')}
                    </Button>
                )}
                <Modal heading={modalData.name} show={isSubOpen} toggleModal={toggleSubModal}>
                    <SubscriptionForm
                        strategyId={modalData.id}
                        subscriptionInfo={modalData.subscription}
                        t={translate}
                        onSuccess={(rsp, values) => {
                            modalData.subscription = values;
                            toggleSubModal();
                        }}
                        onError={() => toggleSubModal()} />
                </Modal>
            </Box>
        );
    };

    const isSubscribed = (subscription) => subscription && subscription.subscriptionType !== 'None';

    const handleStartModal = (original, toggle) => {
        setModalData(original);
        toggle();
    };

    return (
        <TableWrapper
            data={tableData}
            isFilterable={true}
            filterBy={['author', 'pair', 'profit', 'loss', 'actions']}
            columns={[
                {
                    accessor: 'userName',
                    Header: t('author'),
                    Cell: renderSpan
                },
                {
                    accessor: 'name',
                    Header: t('title'),
                    Cell: renderSpan
                },
                {
                    accessor: 'pair',
                    Header: t('pair'),
                    Cell: renderPair
                },
                {
                    accessor: 'description',
                    Header: t('description'),
                    Cell: renderDescripton
                },
                {
                    accessor: 'performance.totalProfit',
                    Header: t('profit'),
                    Cell: renderProfit
                },
                {
                    accessor: 'performance.totalLoss',
                    Header: t('loss'),
                    Cell: renderLoss
                },
                {
                    id: 'actions',
                    accessor: data => data,
                    Header: t('actions'),
                    Cell: renderActions
                }
            ]}
            SubComponent={({
                original,
            }) => {
                return (
                    <Box background="background-3" round={false}>
                        <StrategyInfo
                            data={original}
                        />
                        <StrategyPerformance
                            data={original.performance}
                        />
                    </Box>
                );
            }}
            defaultSorted={[
                {
                    id: 'isFollowed',
                    desc: true,
                },
            ]}
            showPagination={false}
            minRows={tableData.length || 3}
            pageSize={1000}
        />
    );
};

export default withNamespaces()(SharedStrategiesTable);