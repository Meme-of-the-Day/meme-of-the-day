import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import theme from './theme';
import AppBar from './components/appBar/AppBar';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <main>
        <Router>
          <AppBar />
          <Switch>
          </Switch>
        </Router>
      </main>
    </ThemeProvider>
  );
};

export default App;
