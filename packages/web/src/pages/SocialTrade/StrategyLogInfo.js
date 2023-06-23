import { StrategyLogTable } from 'containers/Tables';
import React from 'react';
import { withNamespaces } from 'react-i18next';
import { useParams } from 'react-router-dom';

const StrategyLogInfo = ({ }) => {

    const { id } = useParams();

    return (
        <StrategyLogTable strategyId={id} />
    );
};

export default withNamespaces()(StrategyLogInfo);