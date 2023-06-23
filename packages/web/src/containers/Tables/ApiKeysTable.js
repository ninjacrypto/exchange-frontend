import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { TableWrapper } from 'containers/Tables';
import { handleCopyToClipboard } from 'utils';
import { loadApiKeys, deleteApiKey } from 'redux/actions/apiKeys';
import { FormContainer } from 'components/Form';
import { withNamespaces } from 'react-i18next';

import { nestedTranslate } from 'utils/strings';
import { Loading } from 'components/Loading';
import { Button, Heading, Modal } from 'components/Wrapped';

import styles from './Table.module.scss';

class ApiKeysTable extends React.PureComponent {
  state = {
    show: false,
    key: '',
  };

  open = key => this.setState({ show: true, key });
  close = () => this.setState({ show: false });

  componentDidMount() {
    this.props.loadApiKeys('ALL');
  }

  render() {
    const { show } = this.state;
    const { apiKeys, deleteApiKey, t: translate } = this.props;
    const t = nestedTranslate(translate, 'tables.apiKeys');

    return (
      <Fragment>
        {apiKeys ? (
          <TableWrapper
            data={apiKeys}
            columns={[
              {
                Header: t('key'),
                accessor: 'key',
              },
              {
                Header: t('type'),
                accessor: 'type',
              },
              {
                Header: t('actions'),
                accessor: 'key',
                Cell: ({ original: { key } }) => {
                  return (
                    <Fragment>
                      <Modal
                        show={show}
                        toggleModal={this.close}
                        width='large'
                      >
                        <FormContainer
                          formStyles={styles.formContainer}
                          // Need to do this through state since there's no actual input
                          // for Formik to read value from - instead delete key opens Modal
                          // and Formik needs to be aware of key at time delete button was clicked
                          values={{}}
                          handleSubmit={() =>
                            deleteApiKey(this.state.key, this.close)
                          }
                        >
                          <Heading level={3}>{t('confirmDeleteKey')}</Heading>
                          <div className={styles.buttonGroup}>
                            <Button type="submit" color="primary" size="small">
                              {translate('buttons.yes')}
                            </Button>
                            <Button
                              color="primary"
                              size="small"
                              onClick={this.close}
                            >
                              {translate('buttons.no')}
                            </Button>
                          </div>
                        </FormContainer>
                      </Modal>
                      <Button
                        size="small"
                        color="info"
                        className="m-r-md"
                        onClick={() => handleCopyToClipboard(key)}
                      >
                        {translate('buttons.copy')}
                        <span
                          className="fas fa-copy"
                          style={{
                            fontSize: '0.85em',
                            marginLeft: '10px',
                            cursor: 'pointer',
                          }}
                        />
                      </Button>
                      <Button
                        size="small"
                        color="status-error"
                        onClick={() => this.open(key)}
                      >
                        {translate('buttons.delete')}
                        <span
                          className="fas fa-trash-alt"
                          style={{
                            fontSize: '0.85em',
                            marginLeft: '10px',
                            cursor: 'pointer',
                          }}
                        />
                      </Button>
                    </Fragment>
                  );
                },
              },
            ]}
            showPagination={true}
            minRows={3}
            pageSize={10}
            style={{ fontSize: '14px' }}
          />
        ) : (
          <Loading />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = ({ user }) => ({
  apiKeys: user.apiKeys,
});

export default withNamespaces()(
  connect(
    mapStateToProps,
    { loadApiKeys, deleteApiKey },
  )(ApiKeysTable),
);
