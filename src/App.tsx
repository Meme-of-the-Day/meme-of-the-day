import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import theme from './theme';
import AppBar from './components/appBar/AppBar';
import Home from './pages/Home';
import Upload from './pages/Upload';

const AppBody = styled.main`
  flex: 1;
`;

const Message = styled.div`
  padding: 8px;
`;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar />
        <AppBody>
          <Message><em>Discover, vote, comment, upload, and own your favorite memes</em></Message>
          <Switch>
            <Route exact path="/upload" component={Upload} />
            <Route exact path="/" component={Home} />
          </Switch>
        </AppBody>
      </Router>
    </ThemeProvider>
  );
};

export default App;
