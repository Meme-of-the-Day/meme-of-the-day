import React, { useContext } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

import { UIContext, UIContextType } from "../../App";
import Search from "./Search";

const Main = styled.header`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.white};

  @media screen and (min-width: 768px) {
    height: 80px;
  }
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

const AppBar: React.FC<{}> = () => {
  const location = useLocation();
  const uiContext = useContext<UIContextType>(UIContext);
  const pageTitleFromRoute = {
    "/": "Activity",
    "/rankings": "Rankings",
    "/upload": "Upload",
    "/my-memes": "My Memes"
  };

  return (
    <Main>
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
