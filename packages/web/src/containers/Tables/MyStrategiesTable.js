import React, { useState } from 'react';
import _ from 'lodash';
import { withNamespaces } from 'react-i18next';
import { TableWrapper } from 'containers/Tables';
import { nestedTranslate, trimNumber } from 'utils';
import { PrettyNumberTZ } from 'components/Helpers';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { getSocialTradeInstance } from 'api';
import { useQuery } from 'react-query';

const MyStrategiesTable = ({ t: translate }) => {

    const t = nestedTranslate(translate, 'socialTrade');
    const history = useHistory();
    const authInstance = getSocialTradeInstance();
    const { url } = useRouteMatch();
    const [tableData, setTableData] = useState([]);

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

    useQuery("myStrategies",
        () => authInstance({
            url: '/api/strategy/my-list?limit=1000',
            method: 'GET'
        }),
        {
            onSuccess: (data) => {
                if (data.status === true) {
                    setTableData(data.data);
                }
            }
        });

    return (
        <TableWrapper
            data={tableData}
            isFilterable={true}
            filterBy={['name', 'pair', 'profit', 'loss', 'actions']}
            columns={[
                {
                    id: 'name',
                    accessor: 'name',
                    Header: t('title'),
                    Cell: renderSpan
                },
                {
                    id: 'pair',
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
                }
            ]}
            getTrProps={(state, row, col) => {
                return {
                    onClick: () => history.push(`${url}/${row.original.id}`, { strategy: row.original })
                }
            }}
            defaultSorted={[
                {
                    id: 'created',
                    desc: false,
                },
            ]}
            showPagination={false}
            minRows={tableData.length || 3}
            pageSize={1000}
        />
    );
};

export default withNamespaces()(MyStrategiesTable);