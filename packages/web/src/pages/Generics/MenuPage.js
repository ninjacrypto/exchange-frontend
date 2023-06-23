import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Desktop, TabletDown } from 'components/Responsive';
import { PageWrap } from 'components/Containers';
import { Box, Columns, Column, SideMenu, MobileMenu } from 'components/Wrapped';
import { withRouter } from 'react-router-dom';
import { BoxHeading } from 'components/Helpers';

const MenuPage = ({ contentArea, menuArea, history }) => {
  const pathname = history.location.pathname;
  const currentPage = _.find(menuArea, singleMenuItem => {
    if (singleMenuItem.to === pathname) {
      return singleMenuItem;
    } else if (
      !singleMenuItem.exact &&
      _.startsWith(pathname, singleMenuItem.to)
    ) {
      return singleMenuItem;
    }
  });

  const { hasContentContainer = true, hasTitle = true, title } = currentPage;

  return (
    <PageWrap pad={{ horizontal: 'none', vertical: 'small' }}>
      <Columns flexWrap="wrap">
        <Column width={[1, 1, 1 / 6]} p={2}>
          <Desktop>
            <Box background="background-1" pad="none">
              <SideMenu menuItems={menuArea} />
            </Box>
          </Desktop>
          <TabletDown>
            <Box background="background-1" pad="none">
              <MobileMenu menuItems={menuArea} />
            </Box>
          </TabletDown>
        </Column>
        <Column width={[1, 1, 5 / 6]} p={2}>
          {hasTitle && (
            <BoxHeading>{title ? title : currentPage.children}</BoxHeading>
          )}
          <Box
            background={hasContentContainer ? 'background-3' : 'transparent'}
            pad={hasContentContainer ? 'medium' : 'none'}
            round={hasTitle ? BoxHeading.boxProps.round : 'xxsmall'}
          >
            <Desktop>{React.createElement(contentArea)}</Desktop>
            <TabletDown>{React.createElement(contentArea)}</TabletDown>
          </Box>
        </Column>
      </Columns>
    </PageWrap>
  );
};

MenuPage.propTypes = {
  menuArea: PropTypes.array,
  contentArea: PropTypes.func.isRequired,
  hasContentBackground: PropTypes.bool.isRequired,
};

MenuPage.defaultProps = {
  hasContentBackground: true,
};

export default withRouter(MenuPage);
