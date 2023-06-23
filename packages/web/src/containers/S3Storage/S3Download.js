import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types';
import instance from 'api';
import { isUUID } from 'utils';

class S3Download extends PureComponent {
  state = {
    url: null
  }

  static propTypes = {
    keyName: PropTypes.string.isRequired
  }

  async generateDocumentUrl(keyName) {
    try {
      const data  = await instance({
        url: `/api/get_s3_download_url/${keyName}`,
        method: 'GET',
      });

      if (data.status === 200) {
        this.setState({
          url: data.data.signedURL
        })
      }

    } catch (e) {}
  }

  componentDidMount() {
    const { keyName } = this.props;
    isUUID(keyName) && this.generateDocumentUrl(keyName);
  }

  render() {
    const { url } = this.state;
    const { keyName } = this.props;

    return (
      <Fragment>
        {url ? (
          <a href={url} target="blank">{keyName}</a>
        ) : (
          keyName
        )}
      </Fragment>
    );
  }
}

export default S3Download
