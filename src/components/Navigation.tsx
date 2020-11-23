import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import motd from "../assets/MOTD.svg";
import { UIContext } from "../App";

const Main = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.purple500};
  padding: 20px 30px;
`;

const Logo = styled.img`
  width: 150px;
`;

const CustomNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  padding: 15px 10px;
  width: 100%;
  border-radius: 8px;

  & > img {
    margin-right: 10px;
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.purple400};
  }
`;

const Navigation: React.FC<{ className?: string }> = ({ className }) => {
  const uiContext = useContext(UIContext);

  return (
    <Main className={className} onClick={uiContext.toggleHamburger}>
      <Logo src={motd} alt="MOTD logo" />
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
    </Main>
  );
};

export default Navigation;
