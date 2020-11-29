import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";

import theme from "./theme";
import AppBar from "./components/appBar/AppBar";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import MyMemes from "./pages/MyMemes";

const Main = styled.main`
  display: flex;
  height: 100%;
  width: 100%;
`;

const AppBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 768px) {
    width: auto;
    flex: 1;
  }
`;

const Message = styled.div`
  padding: 8px;
`;

const Footer = styled.footer`
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.blue50};
  border-top: 1px solid ${({ theme }) => theme.colors.blue};
`;

const CustomNavigation = styled(Navigation)<{ open: boolean }>`
  transform: ${props =>
    props.open === true ? "translateX(0)" : "translateX(-100vw)"};
  transition: transform 0.5s ease;
  position: fixed;
  height: 100%;
  z-index: 1;

  @media screen and (min-width: 768px) {
    transform: translateX(0);
    position: static;
  }
`;

export type UIContextType = {
  showHamburger: boolean;
  toggleHamburger: () => void;
};

export const UIContext = React.createContext<UIContextType>({
  showHamburger: false,
  toggleHamburger: () => {}
});

const App: React.FC = () => {
  const [showHamburger, setShowHamburger] = useState(false);

  const windowClickHandler = () => {
    if (showHamburger) {
      setShowHamburger(false);
    }
  };

  useEffect(() => {
    window.addEventListener("click", windowClickHandler);
    return () => {
      window.removeEventListener("click", windowClickHandler);
    };
  }, [showHamburger]);

  return (
    <UIContext.Provider
      value={{
        showHamburger,
        toggleHamburger: () => setShowHamburger(showHamburger => !showHamburger)
      }}
    >
      <ThemeProvider theme={theme}>
        <Router>
          <Main>
            <CustomNavigation open={showHamburger} />
            <AppBody>
              <AppBar />
              {/* <Message>
                <em>
                  Discover, vote, comment, upload, and own your favorite memes
                </em>
              </Message> */}
              <Switch>
                <Route exact path="/upload" component={Upload} />
                <Route exact path="/me" component={MyMemes} />
                <Route exact path="/" component={Home} />
              </Switch>
            </AppBody>
            {/* <Footer>
              Powered by&nbsp;<strong>Matic</strong>
            </Footer> */}
          </Main>
        </Router>
      </ThemeProvider>
    </UIContext.Provider>
  );
};

export default App;
