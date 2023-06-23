import React from 'react';
import { connect } from 'react-redux';
import { Star } from 'grommet-icons';
import styled from 'styled-components';

import { isFavorite } from 'redux/selectors/userSettings';
import { updateFavorites } from 'redux/actions/userSettings';

const StyledStar = styled(Star)`
  width: 20px;
  height: 20px;
`;

const Favorite = ({ isFavorite, tradingPair, updateFavorites }) => {
  const color = isFavorite ? 'plain' : false;
  const handleClick = () =>
    updateFavorites({ tradingPair, remove: isFavorite });

  return <StyledStar color={color} onClick={handleClick} />;
};

const mapStateToProps = (state, props) => ({
  isFavorite: isFavorite(state, props),
});

export default connect(
  mapStateToProps,
  { updateFavorites },
)(Favorite);
