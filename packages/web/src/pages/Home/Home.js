import * as React from 'react';

import { PageWrap } from 'components/Containers';
import { CoinTracker } from 'containers/CoinTracker';
import styles from './Home.module.scss';
import { ResponsiveContext } from 'grommet';

const Home = () => (
  <ResponsiveContext.Consumer>
    {size => (
      <PageWrap
        pad={{
          horizontal: size !== 'small' ? 'xlarge' : 'medium',
          vertical: 'medium',
        }}
        className={styles.homePage}
      >
        <CoinTracker vhLoader={true} />
      </PageWrap>
    )}
  </ResponsiveContext.Consumer>
);

export default Home;
