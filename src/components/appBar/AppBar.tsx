import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import HamburgerMenu from './HamburgerMenu';
import search from '../../assets/search.svg';
import icon from '../../assets/icon.svg';

const Main = styled.div`
  width: 100%;
  height: 90px;
  display:flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px;
`;

const Icon = styled.div`
  display: none;
  background: ${({ theme }) => `linear-gradient(to right, ${theme.colors.blue}, ${theme.colors.indigo})`};
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 80%;
  }

  @media screen and (min-width: 768px) {
    display: flex;
  }
`;

const CustomHamburgerMenu = styled(HamburgerMenu)`
  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const Title = styled.span`
  font-size: 28px;
  margin: 0 16px;
  width: 74%;
  color: ${({ theme }) => theme.colors.blue100};
`;

const SearchIcon = styled.img`
  width: 25px;
`;

const Nav = styled.nav`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  overflow-x: auto;
    
    & > div {
      margin: 0 16px;
      font-size: 22px;
      white-space: nowrap;
      text-align: center;

      &:first-of-type {
        margin-left: 0;
      }
    }
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.gray};

  &.active {
    color: ${({ theme }) => theme.colors.blue};
  }
`;

const AppBar: React.FC<{}> = () => {
  return <Main>
    <CustomHamburgerMenu />
    <Icon>
      <img src={icon} alt="MoTD" />
    </Icon>
    <Title>Meme of the Day</Title>
    <SearchIcon src={search} alt="Search" />
    <Nav>
      <StyledNavLink exact to='/'>Rankings</StyledNavLink>
      <StyledNavLink to='/activity'>Activity</StyledNavLink>
      <StyledNavLink to='/upload'>Upload</StyledNavLink>
      <StyledNavLink to='/me'>My Memes</StyledNavLink>
    </Nav>
  </Main>;
}

export default AppBar;