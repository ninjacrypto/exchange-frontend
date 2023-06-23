import React from 'react';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';
import { Box } from 'grommet';
import { KeyValueRow } from './Controls';
import moment from 'moment';

const StrategyPerformance = ({ data, t: translate }) => {

    const t = nestedTranslate(translate, "socialTrade");
    const rows = [];
    
    Object.keys(data).forEach(propertyName => {
        let value;
        switch (propertyName.toLowerCase()) {
            case 'startdate':
            case 'enddate':
                value = moment(data[propertyName]).format('YYYY-MM-DD HH:mm:ss Z');
                break;
            default:
                value = parseFloat(data[propertyName].toFixed(8)).toString();
                break;
        }
        rows.push(<KeyValueRow label={t(propertyName)} value={value} />);
    });

    return (
        data && (
            <Box>
                <KeyValueRow margin={{ vertical: 'small' }} size="medium" label={t('performance')} />
                {rows}
            </Box>
        )
    );
};

export default withNamespaces()(StrategyPerformance);