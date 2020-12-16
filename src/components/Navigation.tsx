import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";

import motd from "../assets/logo.svg";
import { AuthContext, UIContext } from "../App";

const Main = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.purple500};
`;

const Logo = styled.img`
  width: 150px;
  margin: 40px 30px;
`;

const LinkGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 30px;
`;

const MainLinks = styled(LinkGroup)``;

const OtherLinks = styled(LinkGroup)`
  justify-content: flex-end;
  flex: 1;
`;

const links = css`
  color: ${({ theme }) => theme.colors.white} !important;
  display: flex;
  align-items: center;
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  margin: 10px 0;
`;

const CustomNavLink = styled(NavLink)`
  ${links}

  & > img {
    margin-right: 10px;
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.purple400};
  }
`;

const OutbountLinks = styled.a`
  ${links}
`;

const Login = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  ${links}
  display: none;
  cursor: pointer;

  @media screen and (min-width: 1000px) {
    display: flex;
  }
`;

const Footer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.purple400};
`;

const Navigation: React.FC<{ className?: string }> = ({ className }) => {
  const authContext = useContext(AuthContext);
  const uiContext = useContext(UIContext);

  const { openModal } = uiContext;

  const {
    hasMetamask,
    isMetamaskConnected,
    isConnectedToMatic,
    authenticate,
    authProvider
  } = authContext;

  const login = async () => {
    if (!hasMetamask) {
      openModal();
    } else {
      await authenticate();
    }
  };

  return (
    <Main className={className} onClick={uiContext.toggleHamburger}>
      <Logo src={motd} alt="MOTD logo" />
      <MainLinks>
        <CustomNavLink exact to="/" activeClassName={"active"}>
          Activity
        </CustomNavLink>
        <CustomNavLink exact to="/rankings" activeClassName={"active"}>
          Rankings
        </CustomNavLink>
        <CustomNavLink exact to="/upload" activeClassName={"active"}>
          Upload
        </CustomNavLink>
        <CustomNavLink exact to="/my-memes" activeClassName={"active"}>
          My Memes
        </CustomNavLink>
      </MainLinks>
      <OtherLinks>
        {!authProvider && (
          <Login onClick={async () => await login()}>Login</Login>
        )}
        <OutbountLinks href="https://twitter.com/MemeofDayDApp">
          Twitter
        </OutbountLinks>
      </OtherLinks>
      <Footer>Powered By Matic</Footer>
    </Main>
  );
};

export default Navigation;
