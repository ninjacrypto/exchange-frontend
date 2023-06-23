import React from 'react';
import { connect } from 'react-redux';
import { CompanyContentRoute } from '.';
import { Switch } from 'react-router-dom';

const CompanyRoutes = ({ isContentPagesLoading, contentPages }) => {

  return (
    <Switch>
      {!isContentPagesLoading &&
        Object.values(contentPages).map(
          ({ name, url, active }) =>
            active && <CompanyContentRoute name={name} path={url} key={name} />,
        )}
    </Switch>
  );
};

const mapStateToProps = ({
  exchangeSettings: { isContentPagesLoading, contentPages },
}) => ({ isContentPagesLoading, contentPages });

export default connect(mapStateToProps)(CompanyRoutes);
