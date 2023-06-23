import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PageWrap } from 'components/Containers';
import { Box, Markdown } from 'components/Wrapped';

// #TODO - Convert to use Grommet Markdown (might require some overrides)
class MarkdownContent extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
  };

  render() {
    const { contentPages, name } = this.props;

    return (
      <PageWrap>
        <Box width="large" pad="none" alignSelf="center">
          <Markdown>{contentPages[name].content}</Markdown>
        </Box>
      </PageWrap>
    );
  }
}

const mapStateToProps = ({ exchangeSettings: { contentPages } }) => ({
  contentPages,
});

export default connect(mapStateToProps)(MarkdownContent);
