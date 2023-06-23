import React from 'react';
import { PageWrap } from 'components/Containers';
import { Heading, Message } from 'components/Wrapped';
import { withNamespaces } from 'react-i18next';
import { nestedTranslate } from 'utils';
import { Link } from 'react-router-dom';
import { Button } from 'components/Wrapped';
import styles from './ErrorPages.module.scss';

const GeneralError = withNamespaces() ( ({ t: translate }) => {
  const t = nestedTranslate(translate, 'errorPages');

  return (
    <PageWrap justify="center" align="center">
      <Message background="background-2">
        <Heading level={1}>
          {t('generalError')}
        </Heading>
        <div className={styles.buttonBox}>
          <Link to="/trade">
            <Button margin={{ horizontal: 'xsmall' }} color="primary" >
              {translate('buttons.reload')}
            </Button>
          </Link>
        </div>
      </Message>
    </PageWrap>
  );
},
);

export default GeneralError;
