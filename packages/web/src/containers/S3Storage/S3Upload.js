import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import _ from 'lodash';
import instance from 'api';
import Dropzone from 'react-dropzone';
import { connect as formikConnect, ErrorMessage } from 'formik';

import { triggerToast } from 'redux/actions/ui';

import { withNamespaces } from 'react-i18next';
import { withTheme } from 'styled-components';
import { FormField } from 'components/Form';
import { Image, Text, Box } from 'components/Wrapped';
import { StyledTextInput } from 'components/Form/TextField';

const MB = Math.pow(1024, 4);

class S3Upload extends React.Component {
  state = {
    file: null,
    fileType: null,
    filePreview: null,
    keyName: undefined,
    s3UploadUrl: '',
  };

  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    hideLabel: PropTypes.bool,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    maxSize: PropTypes.number.isRequired,
  };

  static defaultProps = {
    maxSize: 1,
    hideLabel: true,
  };

  async generarteS3Url(extension) {
    try {
      const data = await instance({
        url: `/api/get_s3_upload_url/${extension}`,
        method: 'GET',
      });

      if (data.status === 200) {
        this.setState({
          s3UploadUrl: data.data.signedURL,
          keyName: data.data.keyname,
        });
      }
    } catch (e) {}
  }

  componentDidUpdate(prevProps) {
    const { name, formik } = this.props;
    const path = `formik.values.${name}`;

    if (_.get(this.props, path) === '' && _.get(prevProps, path)) {
      formik.setFieldTouched(name, false, true);
      this.setState({
        file: null,
        filePreview: null,
      });
    }
  }

  async uploadDocument(document, type, extension) {
    const { t, isButtonDisabled } = this.props;

    try {
      isButtonDisabled(true);

      if (!this.state.s3UploadUrl.includes('vultr')) {
        // vultr not found
        const data = await axios({
          url: this.state.s3UploadUrl,
          method: 'PUT',
          transformRequest: [
            (data, headers) => {
              delete headers.common.Authorization;
              delete headers.common.Accept;
              return data;
            },
          ],
          headers: {
            'Content-type': type,
          },
          data: document,
        });

        if (data.status === 200) {
          isButtonDisabled(false);
          this.props.triggerToast(
            t('forms.common.documentUploaded'),
            'success',
            1500,
          );
        }
      }

      if (this.state.s3UploadUrl.includes('vultr')) {
        // vultr found
        let obj = {};
        obj['type'] = 'image/' + extension;

        const data = await axios({
          url: this.state.s3UploadUrl,
          method: 'PUT',
          transformRequest: [
            (data, headers) => {
              delete headers.common.Authorization;
              delete headers.common.Accept;
              return data;
            },
          ],
          headers: {
            'Content-type': obj.type,
          },
          data: document,
        });

        if (data.status === 200) {
          isButtonDisabled(false);
          this.props.triggerToast(
            t('forms.common.documentUploaded'),
            'success',
            1500,
          );
        }
      }
    } catch (e) {
      isButtonDisabled(false);
    }
  }

  handleDrop = async (acceptedFiles, rejectedFiles) => {
    // eslint-disable-next-line no-unused-vars

    if (acceptedFiles) {
      acceptedFiles.forEach(singleFile => {
        const fileReader = new FileReader();
        const self = this;

        fileReader.onload = () => {
          const { formik, name } = self.props;
          const documentFile = fileReader.result;
          const { type } = singleFile;

          const extension = singleFile.name.substring(
            singleFile.name.lastIndexOf('.') + 1,
            singleFile.name.length,
          );

          this.generarteS3Url(extension).then(() => {
            self.setState({
              file: singleFile,
              fileType: type.includes('image') ? 'image' : 'document',
              filePreview: type.includes('image')
                ? URL.createObjectURL(singleFile)
                : documentFile,
            });

            formik.setFieldValue(name, this.state.keyName);

            self.validateFile();
            self.uploadDocument(singleFile, type, extension);
          });
        };

        fileReader.readAsDataURL(singleFile);
      });
    }
    if (rejectedFiles) {
      rejectedFiles.forEach(singleFile => {
        const { formik, t, name } = this.props;
        formik.setFieldError(name, t('forms.validations.invalidFile'));
        formik.setFieldTouched(name, true, false);
      });
    }
  };

  validateFile = () => {
    const { file } = this.state;
    const { name, formik, maxSize, t } = this.props;

    if (file.size > maxSize * MB) {
      formik.setFieldError(name, t('forms.validations.fileTooLarge'));
      formik.setFieldTouched(name, true, false);
    } else {
      formik.setFieldTouched(name, true, true);
    }
  };

  fileName() {
    const { file } = this.state;

    return file
      ? `${file.name} - ${(file.size / Math.pow(1024, 2)).toFixed(3)} MB`
      : '';
  }

  renderFilePreview() {
    const { file, fileType, filePreview } = this.state;
    const { t } = this.props;

    const imagePreview = !_.isEmpty(filePreview) && (
      <Box height="small" width="small" pad="none">
        <Image fit="contain" src={filePreview} />
      </Box>
    );
    const pdfPreview = !_.isEmpty(filePreview) && (
      <a href={filePreview} download={_.get(file, 'name')} target="blank">
        {t('forms.common.download')} {_.get(file, 'name')}
      </a>
    );

    return fileType === 'document' ? pdfPreview : imagePreview;
  }

  render() {
    const { label, placeholder, name, t } = this.props;

    return (
      <React.Fragment>
        <FormField label={label}>
          <Dropzone
            accept="image/*, application/pdf"
            multiple={false}
            onDrop={this.handleDrop}
          >
            {({ getRootProps, getInputProps, open }) => (
              <Box
                pad={{ vertical: 'xsmall' }}
                margin={{ bottom: 'xsmall' }}
                round={false}
              >
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                </div>
                <StyledTextInput
                  placeholder={placeholder}
                  value={this.fileName()}
                  readOnly={true}
                  addonEnd={{
                    content: t('forms.common.browse'),
                    background: 'primary',
                    onClick: () => {
                      open();
                    },
                  }}
                />
                <Box
                  pad={{ horizontal: 'small' }}
                  align="start"
                >
                  <Text color="status-error" size="xsmall">
                    <ErrorMessage name={name} />
                  </Text>
                </Box>
              </Box>
            )}
          </Dropzone>
        </FormField>

        <FormField>
          <React.Fragment>{this.renderFilePreview()}</React.Fragment>
        </FormField>
      </React.Fragment>
    );
  }
}

export default withNamespaces()(
  withTheme(connect(null, { triggerToast })(formikConnect(S3Upload))),
);
