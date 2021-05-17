import React, { useContext } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";

import {
  UIContext,
  UIContextType,
  AuthContextType,
  AuthContext
} from "../../App";
import Search from "./Search";

const Main = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const Title = styled.span`
  font-size: 18px;
  flex: 1;
  color: ${({ theme }) => theme.colors.purple500};
  padding-left: 10px;
  font-weight: 500;

  @media screen and (min-width: 1280px) {
    font-size: 24px;
  }
`;

const CustomSearch = styled(Search)`
  background-color: ${({ theme }) => theme.colors.purple100};
  flex: 1;
  display: none;

  @media screen and (min-width: 768px) {
    order: 1;
    max-width: 300px;
  }
`;

const HamburgerIcon = styled.button`
  height: 15px;
  width: 20px;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0;

  & > div {
    width: 100%;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.purple500};
  }

  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const Message = styled.div`
  width: 100%;
  height: 48px;
  display: none;
  align-items: center;
  padding-left: 8px;
  background-color: ${({ theme }) => theme.colors.purple100};
  color: ${({ theme }) => theme.colors.purple500};
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: bold;

  @media screen and (min-width: 768px) {
    display: flex;
  }
`;

const Connect = styled.span`
  cursor: pointer;
`;

const AppBar: React.FC<{}> = () => {
  const location = useLocation();
  const uiContext = useContext<UIContextType>(UIContext);
  const authContext = useContext<AuthContextType>(AuthContext);
  const pageTitleFromRoute = {
    "/": "Activity",
    "/rankings": "Rankings",
    "/upload": "Upload",
    "/my-memes": "My Memes"
  };

  const {
    hasMetamask,
    isConnectedToMatic,
    isMetamaskConnected,
    authenticate
  } = authContext;

  return (
    <Main>
      {(!hasMetamask || !isMetamaskConnected || !isConnectedToMatic) && (
        <Message>
          {!hasMetamask ? (
            <span>
              <a
                href="https://metamask.io/download.html"
                rel="nofollow, noreferrer"
                target="_blank"
              >
                Please install Metamask to use this app
              </a>
            </span>
          ) : !isMetamaskConnected ? (
            <Connect onClick={authenticate}>
              Please connect with Metamask, <u>click here</u>
            </Connect>
          ) : !isConnectedToMatic ? (
            <span>
              <a
                href="https://blog.matic.network/deposits-and-withdrawals-on-pos-bridge/"
                rel="nofollow, noreferrer"
                target="_blank"
              >
                Please follow the steps <u>here</u> to connect to the MATIC
                network to be able to use this app
              </a>
            </span>
          ) : null}
        </Message>
      )}
      <HamburgerIcon onClick={uiContext.toggleHamburger}>
        <div></div>
        <div></div>
        <div></div>
      </HamburgerIcon>
      <Title>{pageTitleFromRoute[location.pathname]}</Title>
      <CustomSearch />
    </Main>
  );
};

export default AppBar;
