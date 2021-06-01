import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled, { css } from "styled-components";
import { enableTorus, logout } from "../helper/toruslabs";
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

  const [loginCheck, setLoginCheck] = useState(false);

  const { openModal } = uiContext;

  const {
    hasMetamask,
    isMetamaskConnected,
    isConnectedToMatic,
    authenticate,
    authProvider
  } = authContext;

  useEffect(() => {
    const isTorus = sessionStorage.getItem('pageUsingTorus')
    let loginDetail = localStorage.getItem('loginDetails');
    if (loginDetail) {
      setLoginCheck(true)
    }
    if (isTorus) {
      enableTorus(isTorus)
    }
  }, [])


  const login = async () => {
    enableTorus('testing');
    checkLoginStatus();
    if (!hasMetamask) {
      // openModal();

    } else {
      await authenticate();
    }
  };

  const checkLoginStatus = async () => {
    let loginDetail = localStorage.getItem('loginDetails');
    if (loginDetail) {
      setLoginCheck(true);
    } else {
      setTimeout(function () { checkLoginStatus(); }, 3000);

    }

  }

  const logOut = async () => {
    logout();
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };

  let loginDetail = localStorage.getItem('loginDetails');

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
        {loginCheck && (
          <CustomNavLink exact to="/upload" activeClassName={"active"}>
            Upload
          </CustomNavLink>
        )}
        {loginCheck && (
          <CustomNavLink exact to="/my-memes" activeClassName={"active"}>
            My Memes
          </CustomNavLink>
        )}
      </MainLinks>
      <OtherLinks>
        {!loginCheck && (
          <Login onClick={async () => await login()}>Login</Login>
        )}
        {loginCheck && (
          <Login onClick={async () => await logOut()}>Log Out</Login>
        )}
        {/* {!authProvider && (
          <Login onClick={async () => await login()}>Login</Login>
        )} */}

        <OutbountLinks href="https://twitter.com/MemeofDayDApp">
          Twitter
        </OutbountLinks>
      </OtherLinks>
      <Footer>Powered By Matic</Footer>
    </Main>
  );
};

export default Navigation;
