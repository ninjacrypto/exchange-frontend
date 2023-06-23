import React, { useState } from 'react';
import _ from 'lodash';
import {
    Strategy,
    StrategyLogInfo
} from 'pages/SocialTrade';
import {
    BoxButtonPanel,
    BoxButton,
} from './Controls';
import { Button } from 'components/Wrapped';
import {
    MyStrategiesTable,
    SharedStrategiesTable
} from 'containers/Tables';
import { Box, ResponsiveContext } from 'grommet';
import { PageWrap } from 'components/Containers';
import { nestedTranslate } from 'utils/strings';
import { withNamespaces } from 'react-i18next';
import {
    Switch,
    Route,
    useRouteMatch,
    useHistory
} from 'react-router-dom';
import { StrategySelectors } from './Enums';
import { Columns } from 'react-bulma-components';

const SocialTrade = ({ t: translate }) => {

    const t = nestedTranslate(translate, 'socialTrade');
    const history = useHistory();
    const { path, url } = useRouteMatch();
    const [strategiesSelector, setStrategiesSelector] = useState(StrategySelectors.Shared);
    const filterButtons = _.map(StrategySelectors, (v, k) => {
        return (
            <BoxButton
                key={`stf_b_${k}`}
                isActive={strategiesSelector === v}
                onClick={() => setStrategiesSelector(v)}
            >
                {t(v)}
            </BoxButton>
        )
    });
    const renderTable = () => {
        switch (strategiesSelector) {
            case StrategySelectors.Shared:
            case StrategySelectors.Subscribed:
                return <SharedStrategiesTable strategiesSelector={strategiesSelector} />;
            case StrategySelectors.My:
                return <MyStrategiesTable />;
            default:
                return "";
        }
    };

    return (
        <ResponsiveContext.Consumer>
            {size => (
                <PageWrap
                    pad={{
                        horizontal: size !== 'small' ? 'xlarge' : 'medium',
                        vertical: 'medium',
                    }}>
                    <Box background="background-3" pad="medium">
                        <Switch>
                            <Route exact path={path}>
                                <Columns>
                                    <Columns.Column size={8}>
                                        <BoxButtonPanel>
                                            {filterButtons}
                                        </BoxButtonPanel>
                                    </Columns.Column>
                                    <Columns.Column size={4}>
                                        <div style={{ display: "flex" }}>
                                            <Button
                                                align="end"
                                                color="primary"
                                                onClick={() => history.push(`${url}/new`)}
                                                style={{ marginLeft: "auto" }}>
                                                {t('createStrategy')}
                                            </Button>
                                        </div>
                                    </Columns.Column>
                                </Columns>
                                {renderTable()}
                            </Route>
                            <Route exact path={`${path}/:id`} component={Strategy} />
                            <Route exact path={`${path}/:id/log`} component={StrategyLogInfo} />
                        </Switch>
                    </Box>
                </PageWrap>
            )
            }
        </ResponsiveContext.Consumer >
    );
}

export default withNamespaces()(SocialTrade);