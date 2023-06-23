import React from 'react';
import _ from 'lodash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { withNamespaces } from 'react-i18next';
import * as Yup from 'yup';
import { StatusGood } from 'grommet-icons';
import instance, { authenticatedInstance } from 'api';
import {
  DatePicker,
  ImageInput,
  FormField,
  TextField,
  SelectField,
  NumberInput,
  PhoneInput,
} from 'components/Form';
// import { Heading } from 'react-bulma-components';
import { withTheme } from 'styled-components';
import { triggerToast, triggerModalOpen } from 'redux/actions/ui';
import { connect } from 'react-redux';
import { loadProfile } from 'redux/actions/profile';
import {
  Button,
  Paragraph,
  Box,
  Tabs,
  Tab,
  Text,
  Heading,
  Modal,
  Image
} from 'components/Wrapped';
import scriptjs from 'scriptjs';
import { nestedTranslate } from 'utils/strings';
import styled from 'styled-components';
import { Notification } from 'react-bulma-components';
import styles from './Account.module.scss';
import phoneCodes from 'assets/phone.json';
import { ReactSelect } from 'components/Form/SelectField';
import { withRouter } from 'react-router-dom';

const DATE = 'Date';
const DROPDOWN = 'DropDown';
const FILE = 'File';
const PDF = 'PDF';
const TEXT_BOX = 'TextBox';
const RADIO = 'RadioButton';

const APPROVED = 'Approved';
const NEVER_SUBMITTED = 'Never Submitted';
const PENDING = 'Pending';
const REJECTED = 'Rejected';
const REQUESTINFO = 'Request Info';

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-left: 0.75em;
`;

const StyledListItem = styled.li`
  ::before {
    content: '•';
    ${props => `color: ${props.color}`};
    font-weight: bold;
    width: 0.75em;
    margin-left: -0.75em;
    display: inline-block;
  }
`;

const KYCTipsMessage = ({ t: translate, status }) => {
  const t = nestedTranslate(translate, 'account.accountVerification.tips');
  const boxColor = 'background-4';
  const textColor = 'text';
  const headingColor = 'brand';

  const tipList = ['vpn', 'public', 'completed'];

  const renderTip = tip => (
    <StyledListItem key={tip} color={textColor}>
      <Text color={textColor}>{t(tip)}</Text>
    </StyledListItem>
  );

  return (
    <Box background={boxColor} margin={{ bottom: 'small' }}>
      <Heading
        color={headingColor}
        style={{ textAlign: 'center' }}
        margin={{ bottom: 'small' }}
      >
        {t(status === REJECTED ? 'headerFailed' : 'header')}
      </Heading>
      {status === REJECTED && (
        <Paragraph color={textColor} margin={{ bottom: 'xsmall' }}>
          {t('errorMessage')}
        </Paragraph>
      )}
      <StyledList color={textColor}>
        {tipList.map(singleTip => renderTip(singleTip))}
      </StyledList>
    </Box>
  );
};

export const KycRequirementsModal = withRouter(
  withNamespaces()(({ t: translate, handleSuccess, language }) => {
    return (
      <React.Fragment>
        <Box pad="none" margin={{ bottom: 'medium' }} align="center" height="350px">
          {_.isEqual(language.toLowerCase(), 'tr') && (
            <Image src="/assets/img/byteexchange_kyc_TR.png" fit="contain" ></Image>
          )}
         {!_.isEqual(language.toLowerCase(), 'tr') && (
            <Image src="/assets/img/bytedex_kyc.png" fit="contain" ></Image>
          )}
        </Box>
        <Box pad="none" margin={{ bottom: 'medium' }}>
          <Text size="medium" margin={{ bottom: 'small' }}>
          {translate('account.accountVerification.quesOne')}
          </Text>
          <Text size="small" margin={{ bottom: 'small' }}>
          {translate('account.accountVerification.ansOne')}
          </Text>
        </Box>
        <Box pad="none" margin={{ bottom: 'medium' }}>
          <Text size="medium" margin={{ bottom: 'small' }}>
          {translate('account.accountVerification.quesTwo')}
          </Text>
          <Text size="small" margin={{ bottom: 'small' }}>
          {translate('account.accountVerification.ansTwo')}
          </Text>
        </Box>
      </React.Fragment>
    );
  }),
);

class KYCForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      serviceProvider: '',
      validationSchema: null,
      isSubmitting: false,
      schema: {},
      isScriptLoaded: false,
      dft: null,
      dfp: null,
      isOpen: false,
      hasKycLevel: false,
      maxKycLevel: null,
      kycLevel: 1,
      isKycFormHidden: false,
      approvedLevelData: [],
      kycTypeObject: {},
      kycType: '',
      selectedOption: { value: '', label: '' },
      countryCode: '',
    };

    // This binding is necessary to make `this` work in the callback
    this.countryCode = this.countryCode.bind(this);
  }

  visibleFieldCount = 0;
  hasCorporateKyc = false;
  kycType = '';
  initialValues = {};
  validations = {};
  country = '';

  async componentDidMount() {
    const { t, kycStatus, kycApprovedLevel } = this.props;
    if (parseInt(kycApprovedLevel) > 0) {
      this.getUserKyc();
      this.setState({ kycLevel: parseInt(kycApprovedLevel) });
    }
    
    if (_.isEqual(kycStatus, 'Request Info')) {
      this.getUserKyc();
    }

    if (kycStatus === 'Rejected') {
      this.setState({ isKycFormHidden: true });
    }

    this.setupIdmFingerprint();
    scriptjs(`https://cdn1.identitymind.com/dfp-wrapper/d.js`, () => {
      this.setState({ isScriptLoaded: true });
    });

    this.t = t;

    if (this.props.kycType !== 'none') {
      this.setState(
        {
          kycType: this.props.kycType,
          selectedOption: {
            value: this.props.kycType,
            label: this.t(`kyc:KYCType.options.${this.props.kycType}`),
          },
        },
        () => {
          this.handleKycTypeChange(this.state.selectedOption);
        },
      );
    } else {
      this.setState(
        {
          kycType: 'Individual',
          selectedOption: { value: 'individual', label: 'Individual' },
        },
        () => {
          this.handleKycTypeChange(this.state.selectedOption);
        },
      );
    }

    this.getKycForm();

    // this.setKycLevel(kycApprovedLevel);
  }

  async getKycForm() {
    try {
      const { data } = await authenticatedInstance({
        url: '/api/GOKYC_Get_Kyc_Form',
        method: 'GET',
      });

      if (data.status === 'Success') {
        const kycTypeObject = _.find(data.data.fieldsList, {
          fieldName: 'KYCType',
        });

        if (kycTypeObject === undefined || kycTypeObject === null) {
          this.setState({
            selectedOption: { value: 'individual', label: 'Individual' },
          });
        }

        this.setState({ kycTypeObject: kycTypeObject });

        if (kycTypeObject) {
          this.hasCorporateKyc = true;
          // this.kycType = kycTypeObject.value;
        }

        const maxLevel = _.maxBy(data.data.fieldsList, 'level').level;

        this.setState(
          {
            schema: data.data,
            hasKycLevel: maxLevel > 1,
            maxKycLevel: maxLevel,
          },
          () => {
            this.parseSchema();
            if (
              this.props.kycApprovedLevel < this.state.maxKycLevel &&
              this.state.maxKycLevel !== null
            ) {
              this.setState({ isOpen: true });
            }
          },
        );
      } else {
        const { triggerModalOpen } = this.props;
        triggerModalOpen(data.message);
      }
    } catch (e) {}
  }

  componentDidUpdate(prevProps) {
    if (this.props.kycStatus !== prevProps.kycStatus) {
      if (this.props.kycStatus === 'Rejected') {
        this.getKycForm();
      }
    }
  }

  setupIdmFingerprint = () => {
    window.dfpCallback = (error, json) => {
      if (error == null) {
        this.setState({ dfp: JSON.stringify(json) });
      } else {
        this.setState({ dfp: JSON.stringify(error) });
      }
    };
    window.dfpTechnologyIndicator = dfptValue => {
      this.setState({ dft: dfptValue });
    };
  };

  parseSchema() {
    const { schema, approvedLevelData } = this.state;
    const { kycStatus } = this.props;

    // Using the data from the backend, create an array of Components to render
    let fields = [];
    if (
      schema.fieldsList != null &&
      schema.fieldsList !== undefined &&
      schema.fieldsList.length > 0
    ) {
      schema.fieldsList.forEach(singleField => {
        if (approvedLevelData.length > 0) {
          approvedLevelData.forEach(approvedField => {
            if (singleField.fieldName === approvedField.fieldName) {
              // if (
              //   singleField.fieldName === 'BusinessPhone' ||
              //   singleField.fieldName === 'MobilePhone'
              // ) {
              //   return;
              // }
              if (singleField.fieldsList && approvedField.fieldsList) {
                singleField.fieldsList.map(nestedSingleField => {
                  approvedField.fieldsList.map(nestedapprovedField => {
                    if (
                      nestedSingleField.fieldName ===
                      nestedapprovedField.fieldName
                    ) {
                      nestedSingleField.value = nestedapprovedField.value;
                      if (nestedapprovedField.fieldName === 'CountryAlpha2') {
                        if (
                          this.country === nestedapprovedField.value ||
                          this.country === ''
                        ) {
                          this.country = nestedapprovedField.value;
                        }
                      }
                    }
                  });
                });
              } else {
                singleField.value = approvedField.value;
              }
            }
          });
        }

        if (
          this.isFieldActive(singleField) &&
          !_.isEqual(singleField.fieldName, 'deviceData') &&
          !_.isEqual(singleField.fieldName, 'IPaddress')
        ) {
          fields.push(this.handleSingleField(singleField));
        }
      });
    }

    fields.filter(value => !!value);

    this.setState({
      fields,
      serviceProvider: schema.serviceProviderName,
      validationSchema: Yup.object().shape(this.validations),
    });
  }

  getUserKyc = async () => {
    try {
      const { data } = await instance({
        url: '/api/GOKYC_Get_User_KYC',
        method: 'GET',
      });

      if (data.status === 'Success') {
        this.setState({
          approvedLevelData: data.data,
        });
        this.parseSchema();
      } else {
        const { triggerModalOpen } = this.props;
        triggerModalOpen(data.message);
      }
    } catch (e) {}
  };

  handleSubmit = async (values, actions) => {
    const { schema, kycLevel } = this.state;
    const fixedValues = {};

    this.setState({
      isSubmitting: true,
    });

    Object.keys(values).forEach(singleField => {
      _.set(fixedValues, this.fixFieldKey(singleField), values[singleField]);
    });

    const handleSingleSchemaField = (singleField, parentFieldName = '') => {
      const { fieldsList, fieldName } = singleField;
      const fieldKey = `${
        parentFieldName ? `${parentFieldName}.` : ''
      }${fieldName}`;

      const isActive = this.isFieldActive(singleField);
      const hasFieldsList = !_.isEmpty(fieldsList);

      let fieldValue = {
        FieldName: fieldName,
        Value: hasFieldsList ? null : '',
        FieldsList: hasFieldsList
          ? handleSchemaFieldsList(fieldsList, fieldName)
          : null,
        IsIgnored: true,
      };

      if (isActive) {
        fieldValue.IsIgnored = false;
        if (!hasFieldsList) {
          if (_.isEqual(fieldName, 'deviceData')) {
            fieldValue.Value = this.state.dfp;
          } else if (_.isEqual(fieldName, 'IPaddress')) {
            fieldValue.Value = this.props.ipAddress;
          } else {
            fieldValue.Value = _.get(fixedValues, fieldKey);
          }
        }
      }

      if (_.isEqual(fieldValue.FieldName, 'MobilePhone')) {
        if (
          !_.isEqual(this.state.countryCode, '') &&
          !_.isEqual(this.state.countryCode, null)
        ) {
          fieldValue.Value = this.state.countryCode;
        }
      }

      if (_.isEqual(fieldValue.FieldName, 'BusinessPhone')) {
        if (
          !_.isEqual(this.state.countryCode, '') &&
          !_.isEqual(this.state.countryCode, null)
        ) {
          fieldValue.Value = this.state.countryCode;
        }
      }

      return fieldValue;
    };

    const handleSchemaFieldsList = (fieldsList, fieldName = '') =>
      fieldsList.map(singleField =>
        handleSingleSchemaField(singleField, fieldName),
      );

    const formattedValues = handleSchemaFieldsList(schema.fieldsList);

    try {
      const { triggerToast, loadProfile } = this.props;
      const { data } = await instance({
        url: `/api/GOKYC_Submit_KYC_Form?level=${kycLevel}`,
        method: 'POST',
        data: {
          ServiceProviderName: this.state.serviceProvider,
          FieldsList: formattedValues,
        },
      });

      if (data.status === 'Success') {
        const { triggerModalOpen } = this.props;
        triggerModalOpen('successfulKycSubmission');
        // triggerToast('successfulKycSubmission', 'success');
        this.changeStateKycForm();
      } else {
        triggerModalOpen(data.message);
        // triggerToast(data.message, 'error');
      }

      actions.resetForm();
      this.parseSchema();

      this.setState({
        approvedLevelData: [],
        isSubmitting: false,
      });

      loadProfile();
    } catch (e) {}
  };

  fixFieldKey(label) {
    return label.replace('+', '.');
  }

  isFieldActive({ isCorporate, fieldName }) {
    const { kycType, hasCorporateKyc } = this;

    if (
      _.isUndefined(isCorporate) ||
      _.isNull(isCorporate) ||
      _.isEqual(hasCorporateKyc, false)
    ) {
      return true;
    }

    if (hasCorporateKyc) {
      if (_.isEqual(kycType, 'individual') && _.isEqual(isCorporate, false)) {
        return true;
      } else if (
        _.isEqual(kycType, 'corporate') &&
        _.isEqual(isCorporate, true)
      ) {
        return true;
      }
    }

    return false;
  }

  handleDate(singleField) {
    return (
      <DatePicker
        type="date"
        key={singleField.key}
        name={singleField.key}
        label={this.t(`kyc:${this.fixFieldKey(singleField.key)}.label`)}
        placeholder={this.t(
          `kyc:${this.fixFieldKey(singleField.key)}.placeholder`,
        )}
      />
    );
  }

  // handleKycTypeChange({ value }) {
  //   this.visibleFieldCount = 0;
  //   const { kycType } = this;
  //   if (!_.isEqual(value, kycType)) {
  //     this.kycType = value;
  //     this.validations = {};
  //     this.parseSchema();
  //   }
  // }

  handleKycTypeChange({ value }) {
    const { t, kycApprovedLevel } = this.props;
    const { kycType } = this;
    if (!_.isEqual(value, kycType)) {
      this.kycType = value;
      if (this.kycType === 'corporate') {
        this.setState(
          {
            kycLevel: 3,
            kycType: this.kycType,
          },
          () => {
            this.validations = {};
            this.parseSchema();
          },
        );
      } else {
        this.setState(
          {
            kycType: this.kycType,
          },
          () => {
            this.validations = {};
            this.parseSchema();
          },
        );
      }
    }
  }

  handleCountryChange({ value }) {
    if (!value) {
      this.country = null;
      this.parseSchema();
    } else {
      this.country = value;
      this.parseSchema();
    }
  }

  handleDropdown(singleField) {
    const { options } = singleField;

    if (singleField.key === 'KYCType') {
      return;
    }

    const selectOptions = [
      {
        value: '',
        label: this.t('forms.common.select'),
      },
      ...Object.keys(options).map(label => {
        const value = options[label];

        return {
          value,
          label: this.t(
            [
              `kyc:${this.fixFieldKey(singleField.key)}.options.${value}`,
              _.startCase(label),
            ],
            null,
          ),
        };
      }),
    ];

    return (
      <React.Fragment>
        <FormField
          key={singleField.key}
          label={this.t(`kyc:${this.fixFieldKey(singleField.key)}.label`)}
          name={singleField.key}
        >
          <Field
            component={SelectField}
            name={singleField.key}
            options={selectOptions}
            afterChange={
              singleField.fieldName === 'KYCType'
                ? e => {
                    this.handleKycTypeChange(e);
                  }
                : singleField.fieldName === 'CountryAlpha2'
                ? e => {
                    this.handleCountryChange(e);
                  }
                : false
            }
            background="transparent"
            borderColor="border-1"
          />
          <ErrorMessage
            name={singleField.key}
            component="div"
            style={{
              marginTop: '-32px',
              marginBottom: '10px',
              padding: '0px 12px',
            }}
            className={styles.errorMessage}
          />
        </FormField>
      </React.Fragment>
    );
  }

  handleFile(singleField) {
    return (
      <ImageInput
        name={singleField.key}
        key={singleField.key}
        type={singleField.inputType}
        help={this.t(`kyc:${this.fixFieldKey(singleField.key)}.help`, '')}
        label={this.t(`kyc:${this.fixFieldKey(singleField.key)}.label`)}
        placeholder={this.t(
          `kyc:${this.fixFieldKey(singleField.key)}.placeholder`,
        )}
      />
    );
  }

  handleTextField(singleField) {
    return (
      <React.Fragment>
        {!this.fixFieldKey(singleField.key).includes('MobilePhone') &&
          !this.fixFieldKey(singleField.key).includes('BusinessPhone') && (
            <FormField
              label={this.t(`kyc:${this.fixFieldKey(singleField.key)}.label`)}
              type="text"
              hidden={_.isEqual(singleField.fieldName, 'Email')}
              name={singleField.key}
              key={singleField.key}
            >
              <TextField
                help={this.t(
                  `kyc:${this.fixFieldKey(singleField.key)}.help`,
                  '',
                )}
                placeholder={this.t(
                  `kyc:${this.fixFieldKey(singleField.key)}.placeholder`,
                )}
              />
            </FormField>
          )}
        {this.fixFieldKey(singleField.key).includes('MobilePhone') && (
          <FormField
            label={this.t(`kyc:${this.fixFieldKey(singleField.key)}.label`)}
            type="text"
            name={singleField.key}
            key={singleField.key}
          >
            <PhoneInput
              name="mobile"
              countryFieldName="country"
              countryCode={this.countryCode}
            />
          </FormField>
        )}

        {this.fixFieldKey(singleField.key).includes('BusinessPhone') && (
          <FormField
            label={this.t(`kyc:${this.fixFieldKey(singleField.key)}.label`)}
            type="text"
            name={singleField.key}
            key={singleField.key}
          >
            <PhoneInput
              name="mobile"
              countryFieldName="country"
              countryCode={this.countryCode}
            />
          </FormField>
        )}
      </React.Fragment>
    );
  }

  countryCode(inputValue) {
    if (inputValue === undefined) {
      return;
    }

    this.setState({ countryCode: `+${inputValue}` });
  }

  handleMultiField(multiField) {
    const fieldList = multiField.fieldsList.map(singleField =>
      this.handleSingleField(singleField, multiField.fieldName),
    );

    return (
      <React.Fragment key={multiField.fieldName}>
        <Heading level={2} margin={{ bottom: 'small' }}>
          {this.t(`kyc:${multiField.fieldName}.label`)}
        </Heading>
        <Paragraph>{this.t(`kyc:${multiField.fieldName}.help`, '')}</Paragraph>
        {fieldList}
      </React.Fragment>
    );
  }

  handleSingleField(singleField, nestedKey = '') {
    const { kycLevel, kycType } = this.state;
    const { kycStatus, firstName, lastName } = this.props;

    if (kycLevel < singleField.level) {
      return null;
    }

    if (singleField.fieldName != 'KYCType') {
      this.visibleFieldCount = this.visibleFieldCount + 1;
    }
    // Creates nested keys when `handleSingleField` is called from `handleMultiField`
    singleField.key = `${nestedKey ? `${nestedKey}+` : ''}${
      singleField.fieldName
    }`;

    if (singleField.fieldsList) {
      // this.initialValues[singleField.fieldName] = {};

      return this.handleMultiField(singleField);
    } else {
      if (nestedKey) {
        this.initialValues[singleField.key] = '';
      } else {
        this.initialValues[singleField.key] = '';
      }

      if (_.isEqual(singleField.fieldName, 'Email')) {
        this.initialValues[singleField.key] = this.props.email;
      }

      if (singleField.value !== null && singleField.value !== '') {
        this.initialValues[singleField.key] = singleField.value;
      }

      if (singleField.mandatory) {
        this.validations[singleField.key] = Yup.mixed().required();
      }

      if (singleField.fieldName === 'KYCType') {
        this.initialValues[singleField.key] = kycType;
      }

      if (_.isEqual(kycStatus, 'Never Submitted')) {
        if (_.isEqual(singleField.fieldName, 'FirstName')) {
          this.initialValues[singleField.key] = firstName;
        }
        if (_.isEqual(singleField.fieldName, 'LastName')) {
          this.initialValues[singleField.key] = lastName;
        }
      }

      switch (singleField.inputType) {
        case DATE:
          return this.handleDate(singleField);
        case DROPDOWN:
        case RADIO:
          return this.handleDropdown(singleField);
        case FILE:
          return this.handleFile(singleField);
        case PDF:
          return this.handleFile(singleField);
        case TEXT_BOX:
          return this.handleTextField(singleField);
        default:
          return <React.Fragment key={singleField.fieldName} />;
      }
    }
  }

  renderKycForm() {
    const {
      fields,
      validationSchema,
      isSubmitting,
      kycLevel,
      maxKycLevel,
      hasKycLevel,
      selectedOption,
    } = this.state;
    const { t, kycApprovedLevel, language } = this.props;

    return (
      <React.Fragment>
        <Modal
          show={this.state.isOpen}
          toggleModal={this.toggleModal}
          width="large"
          pad="medium"
        >
          <KycRequirementsModal language={language} />
        </Modal>
        {fields.length > 0 && (
          <Formik
            validateOnChange={false}
            validationSchema={validationSchema}
            initialValues={this.initialValues}
            onSubmit={this.handleSubmit}
          >
            {props => (
              <React.Fragment>
                {selectedOption.value !== '' &&
                  (selectedOption.value === 'individual' ? (
                    <Tabs
                      onActive={index =>
                        this.setKycLevel(index + 1, props.resetForm)
                      }
                      activeIndex={kycLevel - 1}
                    >
                      {_.times(maxKycLevel, value => {
                        const level = value + 1;
                        return (
                          <React.Fragment>
                            <Tab
                              title={t('account.accountVerification.kycLevel', {
                                level,
                              })}
                              key={level}
                            >
                              {kycLevel === level && (
                                <React.Fragment>
                                  {kycLevel > kycApprovedLevel && (
                                    <Form>
                                      {fields}

                                      {fields.length > 1 &&
                                        this.visibleFieldCount > 0 && (
                                          <Button
                                            color="primary"
                                            type="submit"
                                            disabled={isSubmitting}
                                            loading={isSubmitting}
                                          >
                                            {this.t('buttons.submit')}
                                          </Button>
                                        )}
                                    </Form>
                                  )}
                                </React.Fragment>
                              )}
                            </Tab>
                          </React.Fragment>
                        );
                      })}
                    </Tabs>
                  ) : (
                    <React.Fragment>
                      {kycLevel > kycApprovedLevel && (
                        <Form>
                          {fields}

                          {fields.length > 1 && this.visibleFieldCount > 0 && (
                            <Button
                              color="primary"
                              type="submit"
                              disabled={isSubmitting}
                              loading={isSubmitting}
                            >
                              {this.t('buttons.submit')}
                            </Button>
                          )}
                        </Form>
                      )}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            )}
          </Formik>
        )}
        {kycApprovedLevel >= kycLevel && selectedOption.value !== '' && (
          <Box fill={true} justify="center" align="center">
            <StatusGood
              color="status-ok"
              size="xlarge"
              style={{ margin: '1rem' }}
            />
            <Heading fontWeight={300} level={2} margin="xsmall">
              {t('account.accountVerification.verificationMsg')}
              {kycApprovedLevel}
            </Heading>
          </Box>
        )}
      </React.Fragment>
    );
  }

  setKycLevel(level, resetForm) {
    this.setState(
      {
        kycLevel: level,
        serviceProvider: '',
        validationSchema: null,
      },
      () => {
        resetForm();
        this.validations = {};
        this.parseSchema();
      },
    );
  }

  // renderKycLevelTabs() {
  //   const { maxKycLevel, kycLevel } = this.state;
  //   const { t  } = this.props;
  //   return (
  //     <Tabs onActive={index => this.setKycLevel(index + 1)} activeIndex={kycLevel - 1}>
  //       {_.times(maxKycLevel, value => {
  //         const level = value + 1;
  //         return (
  //           <React.Fragment>
  //                 <Tab
  //                 title={t('account.accountVerification.kycLevel', { level })}
  //                 key={level}
  //               >
  //                 {kycLevel === level && this.renderKycForm()}
  //               </Tab>
  //           </React.Fragment>
  //         );
  //       })}
  //     </Tabs>
  //   );
  // }

  showKycForm() {
    this.setState({ isKycFormHidden: false });
  }

  changeStateKycForm() {
    this.setState({ isKycFormHidden: true });
  }

  createMarkup() {
    const { kycRejectReason } = this.props;

    return { __html: kycRejectReason };
  }

  createMarkupRequestInfo() {
    const { kycRequestInfo } = this.props;

    return { __html: kycRequestInfo };
  }

  renderKycTypeDropdownOptions() {
    const { kycTypeObject } = this.state;
    const { t, kycType } = this.props;
    const { options } = kycTypeObject;

    if (options == null || options === undefined) {
      return;
    }

    let selectOptions = [];
    Object.keys(options).map(val => {
      if (kycType === val) {
        const defaultOption = {
          value: val,
          label: this.t(
            `kyc:${this.fixFieldKey(kycTypeObject.fieldName)}.options.${val}`,
          ),
        };
        this.handleKycTypeChange(defaultOption);
        selectOptions.push(defaultOption);
      } else if (kycType === 'none') {
        selectOptions.push({
          value: val,
          label: this.t(
            `kyc:${this.fixFieldKey(kycTypeObject.fieldName)}.options.${val}`,
          ),
        });
      }
    });
    selectOptions.unshift({ value: '', label: t('forms.common.select') });
    return selectOptions;
  }

  handleChange = selectedOption => {
    // if(_.isEqual(selectedOption?.value, '')) this.setState({ isShowInfoIndividual: true });
    this.setState({ selectedOption }, () => {
      this.handleKycTypeChange(selectedOption);
    });
  };

  renderKycTypeDropdown() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <Text margin={{ bottom: '0.5rem' }} style={{ fontWeight: 'bold' }}>
          {t(`kyc:${this.fixFieldKey('KYCType')}.label`)}
        </Text>
        <ReactSelect
          options={this.renderKycTypeDropdownOptions()}
          onChange={this.handleChange}
          value={this.state.selectedOption}
          margin={{ bottom: 'small' }}
        />
      </React.Fragment>
    );
  }

  toggleModal = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const { hasKycLevel, isKycFormHidden, kycLevel, maxKycLevel } = this.state;
    const {
      t,
      kycApprovedLevel,
      kycStatus,
      kycRejectReason,
      kycRequestInfo,
    } = this.props;

    return (
      <React.Fragment>
        {kycApprovedLevel < maxKycLevel && maxKycLevel !== null && (
          <Box pad="none">
            {isKycFormHidden && (
              <React.Fragment>
                <KYCTipsMessage status={kycStatus} t={t} />
                {kycRejectReason && (
                  <Notification color="danger">
                    {t('account.accountVerification.rejectionReason')}:{' '}
                    <div dangerouslySetInnerHTML={this.createMarkup()} />
                  </Notification>
                )}
              </React.Fragment>
            )}
            {isKycFormHidden && (
              <Button
                color="primary"
                size="small"
                type="button"
                onClick={() => this.showKycForm()}
              >
                {t('account.accountVerification.tryAgain')}
              </Button>
            )}

            {_.isEqual(kycStatus, 'Request Info') && (
              <React.Fragment>
                <KYCTipsMessage status={kycStatus} t={t} />

                {kycRequestInfo && (
                  <Notification color="warning">
                    {t('account.accountVerification.requestInfo')}:{' '}
                    <div
                      dangerouslySetInnerHTML={this.createMarkupRequestInfo()}
                    />
                  </Notification>
                )}
              </React.Fragment>
            )}
            {!isKycFormHidden && (
              <React.Fragment>
                {this.state.kycTypeObject !== undefined &&
                  this.renderKycTypeDropdown()}
                {this.renderKycForm()}
              </React.Fragment>
            )}
          </Box>
        )}

        {kycApprovedLevel >= maxKycLevel && maxKycLevel !== null && (
          <Box fill={true} justify="center" align="center">
            <StatusGood color="status-ok" size="xlarge" />
            <Heading fontWeight={300} level={2} margin="xsmall">
              {t('account.accountVerification.congratulations')}
            </Heading>
            <Text size="large" weight={300} margin={{ bottom: 'xsmall' }}>
              {t('account.accountVerification.approved')}
            </Text>
          </Box>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({
  exchangeSettings: {
    settings: { client_IP },
    language
  },
  user: {
    profile: {
      email,
      kycStatus,
      kycApprovedLevel,
      kycRejectReason,
      kycType,
      kycRequestInfo,
      firstName,
      lastName,
    },
  },
}) => ({
  ipAddress: client_IP,
  email,
  kycStatus,
  kycApprovedLevel,
  kycRejectReason,
  kycType,
  kycRequestInfo,
  firstName,
  lastName,
  language
});

export default withNamespaces(['translation', 'kyc'])(
  connect(mapStateToProps, { triggerToast, loadProfile, triggerModalOpen })(
    withTheme(KYCForm),
  ),
);
