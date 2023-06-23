import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Box, Text } from 'components/Wrapped';

class ControlledTabs extends Component {
  state = {
    activeTab: this.props.activeTab,
  };

  handleTabClick = tabIndex => e => {
    this.setState({
      activeTab: tabIndex,
    });
    e.stopPropagation();
  };

  render() {
    const {
      tabProps,
      tabItemProps,
      renderAllChildren,
      containerProps,
      tabContentProps,
      otherTabs
    } = this.props;
    const { activeTab } = this.state;
    const {
      className: tabContentClassName,
      ...tabContentRest
    } = tabContentProps;
    const children = this.props.children.length
      ? this.props.children
      : [this.props.children];

    return (
      <div {...containerProps}>
        <Box
          pad={{ horizontal: 'small', top: 'small', bottom: 'xsmall' }}
          direction="row"
          gap="small"
          flex={false}
          round={false}
          {...tabProps}
          background="background-4"
          justify="between"
        >
          <Box pad="none" direction="row" gap="small">
          {children.map((singleItem, i) => {
            const isActive = activeTab === i;
            return (
              <Box
                pad="none"
                border={{
                  side: 'bottom',
                  size: 'small',
                  color: isActive ? 'primary' : 'transparent',
                }}
                round={false}
                onClick={this.handleTabClick(i)}
                focusIndicator={false}
                key={i}
                {...tabItemProps}
              >
                <Text weight={isActive ? 'bold' : 'normal'}>
                  {singleItem.props.title}
                </Text>
              </Box>
            );
          })}
          </Box>
          {otherTabs}
          
          {/* <Tabs {...tabProps}>
            <Box
              pad="none"
              direction="row"
              // justify="between"
              fill="horizontal"
              flex={false}
            >
              {children.map((singleItem, i) => (
                <Tabs.Tab
                  {...tabItemProps}
                  active={activeTab === i}
                  key={i}
                  onClick={this.handleTabClick(i)}
                >
                  {singleItem.props.title || 'Add a Title Prop'}
                </Tabs.Tab>
              ))}
            </Box>
          </Tabs> */}
        </Box>
        {renderAllChildren ? (
          <Fragment>
            {children.map((singleItem, i) => (
              <div
                key={i}
                className={classNames(
                  { 'is-hidden': activeTab !== i },
                  'overflow-auto',
                  tabContentClassName,
                )}
                {...tabContentRest}
              >
                {React.cloneElement(singleItem, { isActive: activeTab === i })}
              </div>
            ))}
          </Fragment>
        ) : (
          <Fragment>
            <div {...tabContentProps}>{children[activeTab]}</div>
          </Fragment>
        )}
      </div>
    );
  }
}

ControlledTabs.propTypes = {
  containerProps: PropTypes.object,
  tabContentProps: PropTypes.object,
  tabProps: PropTypes.object,
  tabItemProps: PropTypes.object,
  activeTab: PropTypes.number,
  children: PropTypes.node,
  renderAllChildren: PropTypes.bool,
};

ControlledTabs.defaultProps = {
  activeTab: 0,
  renderAllChildren: true,
  tabContentProps: {
    className: '',
  },
};

export default ControlledTabs;
