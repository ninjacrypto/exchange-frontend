import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Box, Paragraph } from 'components/Wrapped';




class Cryptonews extends Component {
  render() {


    return (
     
<iframe width="100%" height="315" src="https://www.cubecrypto.io" title="Cubecrypto by Bytedex" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    );
  }
}

const mapStateToProps = ({ exchange: { depthChartData, tradingPair } }) => ({
  depthChartData,
  tradingPair,
});

export default connect(mapStateToProps)(Cryptonews);
