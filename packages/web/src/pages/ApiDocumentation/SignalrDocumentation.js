import React from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Box, Heading } from 'components/Wrapped';
import { websocketUrl } from 'setup';


const SignalrDocumentation = ({ theme }) => {
    const signalrIframe = '<iframe style="width:100%; height: 130vh" name="' + theme.themeName + '&'+ websocketUrl + '" src="/documentation-files/signalr.html" />';
    return (
        <div>
      <React.Fragment>
        <Box background="background-1">
        <div dangerouslySetInnerHTML={{ __html: signalrIframe}}></div>
        </Box>
      </React.Fragment>
        </div>
    );
}

const mapStateToProps = ({
    exchangeSettings: {
      settings: { exchangeName },
    },
    ui: { theme }
  }) => ({
    exchangeName,
    theme: theme
  });
  
  export default withNamespaces()(connect(mapStateToProps)(SignalrDocumentation));