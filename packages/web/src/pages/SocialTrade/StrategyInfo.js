import React from 'react';
import { Box } from "grommet";
import { withNamespaces } from "react-i18next";
import { nestedTranslate } from 'utils';
import { KeyValueRow } from './Controls';

const StrategyInfo = ({ data, t: translate }) => {

    const t = nestedTranslate(translate, "socialTrade");

    return (
        data && (
            <Box>
                <KeyValueRow margin={{ bottom: 'small' }} size="medium" label={data.title} />

                <KeyValueRow label={t('author')} value={data.author} />
                <KeyValueRow label={t('pair')} value={`${data.baseCurrency}/${data.quoteCurrency}`} />

                <KeyValueRow margin={{ top: 'small' }} value={data.description} />
            </Box>
        )
    );
};

export default withNamespaces()(StrategyInfo);