import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import instance from 'api';
import { Image } from 'grommet-icons';
import { Box } from 'components/Wrapped';

class S3Download extends PureComponent {
  state = {
    url: null,
  };

  static propTypes = {
    keyName: PropTypes.string.isRequired,
  };

  async generateDocumentUrl(keyName) {
    try {
      const data = await instance({
        url: `/api/get_s3_download_url/${keyName}`,
        method: 'GET',
      });

      if (data.status === 200) {
        this.setState(
          {
            url: data.data.signedURL,
          },
          () => {
            window.open(this.state.url, '_blank');
          },
        );
      }
    } catch (e) {}
  }

  render() {
    const { keyName } = this.props;
    return (
      <Fragment>
        <Box pad="none" onClick={() => this.generateDocumentUrl(keyName)}>
          <Image />
        </Box>
      </Fragment>
    );
  }
}

export default S3Download;
