import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { PageWrap } from 'components/Containers';
import { Logo } from 'containers/Logo';
import { Box, Heading } from 'components/Wrapped';
import { useMediaQuery } from 'react-responsive';

const Authentication = ({ children, title }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  return (
    <PageWrap justify="center" align="center" pad="none">
      <Box
        background="background-2"
        elevation="elevation-2"
        width={isMobile ? { max: '100%' } : '550px'}
        align="center"
        flex={false}
        margin={{ vertical: 'large' }}
        responsive={false}
        gap="small"
      >
        <Box pad={{ horizontal: 'large' }} responsive={false}>
          <Link to="/">
            <Logo />
          </Link>
        </Box>
        {title && <Heading level={2}>{title}</Heading>}
        <Box pad="none" fill="horizontal">
          {children}
        </Box>
      </Box>
    </PageWrap>
  );
};

Authentication.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};

export default Authentication;
