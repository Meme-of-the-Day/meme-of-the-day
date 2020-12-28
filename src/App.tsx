import React, { useState, useEffect } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import Web3 from "web3";

import theme from "./theme";
import AppBar from "./components/appBar/AppBar";
import Navigation from "./components/Navigation";
import MessageModal from "./components/MessageModal";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import MyMemes from "./pages/MyMemes";
import Rankings from "./pages/Rankings";
import MemeDetail from "./pages/MemeDetail";
import { AuthProvider, authenticate } from "./utils/UserAuth";

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

export type AuthContextType = {
  authProvider?: AuthProvider;
  authenticate: () => void;
  hasMetamask: boolean;
  isConnectedToMatic: boolean;
  isMetamaskConnected: boolean;
};

export const AuthContext = React.createContext<AuthContextType>({
  authenticate: () => {},
  hasMetamask: false,
  isConnectedToMatic: false,
  isMetamaskConnected: false
});

export type UIContextType = {
  showHamburger: boolean;
  toggleHamburger: () => void;
  showModal: boolean;
  closeModal: () => void;
  openModal: () => void;
};

export const UIContext = React.createContext<UIContextType>({
  showHamburger: false,
  toggleHamburger: () => {},
  showModal: false,
  closeModal: () => {},
  openModal: () => {}
});

const App: React.FC = () => {
  const [showHamburger, setShowHamburger] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [authProvider, setAuthProvider] = useState<AuthProvider | undefined>(
    undefined
  );

  const [isConnectedToMatic, setIsConnectedToMatic] = useState(false);
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);

  const windowClickHandler = () => {
    if (showHamburger) {
      setShowHamburger(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(Web3.givenProvider);
      web3.eth.getChainId().then(id => {
        if (id === 80001 || id === 137 || id === 3431) {
          setIsConnectedToMatic(true);
        } else {
          setIsConnectedToMatic(false);
        }
        web3.eth.getAccounts().then(accounts => {
          if (accounts.length > 0) {
            setIsMetamaskConnected(true);
          } else {
            setIsMetamaskConnected(false);
          }
        });
      });
      setHasMetamask(true);

      if (window.ethereum.on) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      }
    } else {
      setHasMetamask(false);
      setIsConnectedToMatic(false);
    }
  });

  useEffect(() => {
    window.addEventListener("click", windowClickHandler);
    return () => {
      window.removeEventListener("click", windowClickHandler);
    };
  }, [showHamburger]);

  async function login() {
    const authProvider: AuthProvider = await authenticate();
    setAuthProvider(authProvider);
  }

  return (
    <UIContext.Provider
      value={{
        showHamburger,
        toggleHamburger: () =>
          setShowHamburger(showHamburger => !showHamburger),
        showModal,
        closeModal: () => setShowModal(false),
        openModal: () => setShowModal(true)
      }}
    >
      <AuthContext.Provider
        value={{
          authProvider,
          authenticate: login,
          hasMetamask,
          isConnectedToMatic,
          isMetamaskConnected
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
                  <Route exact path="/meme/:cid" component={MemeDetail} />
                  <Route exact path="/rankings" component={Rankings} />
                  <Route exact path="/me" component={MyMemes} />
                  <Route exact path="/" component={Home} />
                </Switch>
              </AppBody>
              <MessageModal />
            </Main>
          </Router>
        </ThemeProvider>
      </AuthContext.Provider>
    </UIContext.Provider>
  );
};

export default App;
