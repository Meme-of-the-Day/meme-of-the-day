import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import theme from './theme';
import AppBar from './components/appBar/AppBar';
import Home from './pages/Home';

const AppBody = styled.main`
  flex: 1;
`;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar />
        <AppBody>
          <Switch>
            <Route exact path="/" component={Home} />
          </Switch>
        </AppBody>
      </Router>
    </ThemeProvider>
  );
};

export default App;
