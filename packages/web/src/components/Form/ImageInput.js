import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import Compressor from 'compressorjs';
import { connect, ErrorMessage } from 'formik';
import { withNamespaces } from 'react-i18next';

import { withTheme } from 'styled-components';
import { Box, Image, Text, Button } from 'components/Wrapped';
import { StyledTextInput } from './TextField';
import { reaction } from 'mobx';
import { DocumentPdf } from 'grommet-icons';

const MB = Math.pow(1024, 2);

class ImageInput extends React.Component {
  state = {
    file: null,
    filePreview: null,
    filePriviewBase64: null,
  };

  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    maxSize: PropTypes.number.isRequired,
  };

  static defaultProps = {
    maxSize: 1,
  };

  componentDidMount() {
    const { name, formik } = this.props;
    const path = `formik.values.${name}`;
    this.setState({
      filePriviewBase64: _.get(this.props, path)
    });
  }

  componentDidUpdate(prevProps) {
    const { name, formik } = this.props;
    const path = `formik.values.${name}`;

    if (_.get(this.props, path) === '' && _.get(prevProps, path)) {
      formik.setFieldTouched(name, false, true);
      this.setState({
        file: null,
        filePreview: null,
        filePriviewBase64: null,
      });
    }
  }

  handleDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles) {
      acceptedFiles.forEach(singleFile => {
        const fileReader = new FileReader();
        const self = this;
        new Compressor(singleFile, {
          quality: 0.65,
          success(result) {
            self.setState({
              file: result,
              filePreview: URL.createObjectURL(result),
              filePriviewBase64: null,
            });

            fileReader.onload = () => {
              const { formik, name } = self.props;
              const fileUrl = fileReader.result;
              formik.setFieldValue(name, fileUrl);
              self.validateFile();
            };

            fileReader.readAsDataURL(result);
          },
        });
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

  handlePDF = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles) {
      acceptedFiles.forEach(singleFile => {
        let file = null;
        let fileName = "";
            // Select the very first file from list
            let fileToLoad = singleFile;
            fileName = fileToLoad.name;
            
            this.setState({
              file: singleFile,
              filePreview: null,
              filePriviewBase64: null,
            })
            // FileReader function for read the file.
            let fileReader = new FileReader();
            // Onload of file read the file content
            // fileReader.onload = function(fileLoadedEvent) {
            //     file = fileLoadedEvent.target.result;
            //     // Print data in console
            //     console.log('file',file);
            // };
            fileReader.onload = () => {
              const { formik, name } = this.props;
              const fileUrl = fileReader.result;
              formik.setFieldValue(name, fileUrl);
              this.validateFile();
            };
            // Convert data to base64
            fileReader.readAsDataURL(fileToLoad);
      });
    }

    if (rejectedFiles) {
      rejectedFiles.forEach(singleFile => {
        const { formik, t, name } = this.props;
        formik.setFieldError(name, t('forms.validations.invalidPDF'));
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

  delete(state) {
    const { filePreview, filePriviewBase64, file } = state;
    const { name, formik } = this.props;
    this.setState({
      file: null,
      filePreview: null,
      filePriviewBase64: null,
    });
    formik.setFieldValue(name, '');
  }

  fileName() {
    const { file } = this.state;

    return file
      ? `${file.name} - ${(file.size / Math.pow(1024, 2)).toFixed(2)} MB`
      : '';
  }

  renderFilePreview() {
    const { filePreview, filePriviewBase64 } = this.state;
    const { t } = this.props;
    return (
      <React.Fragment>
        {filePreview && (
            <div style={{marginTop:"15px", display:"flex", alignItems:"center"}}>
            <div style={{width:"210px", height:"auto", marginRight:"15px"}}>
            <Image fit="contain" src={filePreview} />
              </div> 
            <div>
            <Button color="primary" type="submit" style={{marginTop:"10px"}} size="small" onClick={() => this.delete(this.state)}> {t('forms.common.clearImage')}</Button>
            </div>
            </div>
        )}
        {filePriviewBase64 && (
           <div style={{marginTop:"15px", display:"flex", alignItems:"center", border: '1px solid var(--border-1)', borderRadius: '10px', padding: '1rem'}}>
           <div style={{width:"210px", height:"auto", marginRight:"15px"}}>
           <Image fit="contain" src={filePriviewBase64} />
             </div> 
           <div>
           <Button color="primary" type="submit" style={{marginTop:"10px"}} size="small" onClick={() => this.delete(this.state)}> {t('forms.common.clearImage')}</Button>
           </div>
           </div>
        )}
      </React.Fragment>
    );
  }

  renderPDFPreview() {
    const { filePreview, filePriviewBase64 } = this.state;
    return (
      <React.Fragment>
        {filePriviewBase64 && (
          <Box height="small" width="small" pad="none">
            <DocumentPdf color="status-ok" size="xlarge" style={{margin: "1rem"}} />
            {this.clearPDFPreview()}
          </Box>
        )}
      </React.Fragment>
    );
  }

  clearPDFbutton() {
    const { file } = this.state;
    const { t } = this.props;
    return (
      <React.Fragment>
        {file && (
            <div >
            <Button color="primary" type="submit" style={{marginTop:"10px"}} size="small" onClick={() => this.delete(this.state)}> {t('forms.common.clearPdf')}</Button>
            </div>
        )}
      </React.Fragment>
    );
  }

  clearPDFPreview() {
    const { file } = this.state;
    const { t } = this.props;
    return (
      <React.Fragment>
        <Button color="primary" type="submit" style={{marginTop:"10px"}} size="small" onClick={() => this.delete(this.state)}> {t('forms.common.clearPdf')}</Button>
      </React.Fragment>
    );
  }

  render() {
    const { label, placeholder, t, formik, name, help, type } = this.props;
    const { filePriviewBase64 } = this.state;
    const hasErrors = _.get(formik.touched, name) && _.get(formik.errors, name);
    return (
      <Box pad="none" margin={{ bottom: 'medium' }} gap="xsmall">
        {!filePriviewBase64 && (
          <React.Fragment>
            {label && (
              <Text size="medium" weight="bold">
                {label}
              </Text>
            )}
            {help && <Text size="xsmall">{help}</Text>}
            {type == 'PDF' && (
               <Box pad="none">
               <Dropzone accept="application/pdf" multiple={false} onDrop={this.handlePDF}>
                 {({ getRootProps, getInputProps, open }) => (
                   <>
                     <div {...getRootProps()}>
                       <input {...getInputProps()} />
                     </div>
                     <StyledTextInput
                         value={this.fileName()}
                         placeholder={placeholder}
                         readOnly={true}
                         addonEnd={{
                           content: t('forms.common.fileDialog', {type}),
                           background: 'primary',
                           onClick: () => open(),
                         }}
                       />
                   </>
 
                 )}
               </Dropzone>
             </Box>
            )}

{type == 'File' && (
               <Box pad="none">
               <Dropzone accept="image/*" multiple={false} onDrop={this.handleDrop}>
                 {({ getRootProps, getInputProps, open }) => (
                   <>
                     <div {...getRootProps()}>
                       <input {...getInputProps()} />
                     </div>
                     <StyledTextInput
                         value={this.fileName()}
                         placeholder={placeholder}
                         readOnly={true}
                         addonEnd={{
                           content: t('forms.common.fileDialog', {type}),
                           background: 'primary',
                           onClick: () => open(),
                         }}
                       />
                   </>
 
                 )}
               </Dropzone>
             </Box>
            )}
           
            {hasErrors && (
              <Box pad={{ horizontal: 'small' }} align="start">
                <Text color="status-error" size="xsmall">
                  <ErrorMessage name={name} />
                </Text>
              </Box>
            )}
          </React.Fragment>
        )}

{type == 'File' && (
  <Box pad="none">
          <Text size="medium" weight="bold">
            {t('forms.common.imagePreview')}
          </Text>
          {this.renderFilePreview()}
        </Box>
)}
{type == 'PDF' && (
  <Box pad="none">
    {this.renderPDFPreview()}
          {this.clearPDFbutton()}
        </Box>
)}
        
      </Box>
    );
  }
}

export default withNamespaces()(withTheme(connect(ImageInput)));
