import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import theme from './theme';
import AppBar from './components/appBar/AppBar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import MyMemes from './pages/MyMemes';

const AppBody = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  padding: 8px;
`;

const Footer = styled.footer`
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.blue50};
  border-top: 1px solid ${({ theme }) => theme.colors.blue};
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
            <Route exact path="/me" component={MyMemes} />
            <Route exact path="/" component={Home} />
          </Switch>
        </AppBody>
        <Footer>
          Powered by&nbsp;<strong>Matic</strong>
        </Footer>
      </Router>
    </ThemeProvider>
  );
};

export default App;
