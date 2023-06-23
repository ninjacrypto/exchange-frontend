import React from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { PropTypes } from 'prop-types';
import { Box } from 'components/Wrapped';

class MarkdownDocumentation extends React.Component {
  state = {
    documentation: '',
  };

  static propTypes = {
    markdownPath: PropTypes.string.isRequired,
  };

  async componentDidMount() {
    try {
      const { markdownPath, transformData } = this.props;
      let { data } = await axios.get(markdownPath);

      if (transformData) {
        data = transformData(data);
      }

      this.setState({
        documentation: data,
      });
    } catch (e) {}
  }

  render() {
    return (
      <React.Fragment>
        <Box background="background-1">
          <ReactMarkdown source={this.state.documentation} />
        </Box>
      </React.Fragment>
    );
  }
}

export default MarkdownDocumentation;
