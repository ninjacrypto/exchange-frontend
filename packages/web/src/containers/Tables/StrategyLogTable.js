import React from 'react';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import TableWrapper from './TableWrapper';
import moment from 'moment';
import { useQuery } from 'react-query';
import { getSocialTradeInstance } from 'api';
import { nestedTranslate } from 'utils';

const StrategyLogTable = ({ strategyId, t: translate }) => {
    const t = nestedTranslate(translate, 'socialTrade');
    const authInstance = getSocialTradeInstance();

    const renderDate = ({ value }) => {
        return (<span>{moment(value).format('YYYY-MM-DD HH:mm:ss Z')}</span>);
    };

    const renderEventType = ({ value }) => {
        return (<span>{value}</span>);
    };

    const {
        isLoading,
        data = {
            data: {}
        }
    } = useQuery("strategyLog_" + strategyId, () =>
        authInstance({
            url: '/api/strategy/log?strategyId=' + strategyId,
            method: 'GET'
        }));

    return (
        !isLoading && (
            <TableWrapper
                data={data.data}
                isFilterable={true}
                filterBy={['timestamp']}
                columns={[
                    {
                        id: 'timestamp',
                        accessor: 'timestamp',
                        Header: t('date'),
                        Cell: renderDate
                    },
                    {
                        id: 'eventType',
                        accessor: 'eventType',
                        Header: t('type'),
                        Cell: renderEventType
                    }
                ]}
                defaultSorted={[
                    {
                        id: 'timestamp',
                        desc: true,
                    },
                ]}
                showPagination={false}
                minRows={data.data.length || 1}
                pageSize={1000}
            />
        ));
};

export default withNamespaces()(StrategyLogTable);