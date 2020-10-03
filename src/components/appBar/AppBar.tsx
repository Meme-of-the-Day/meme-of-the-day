import React from 'react';
import styled from 'styled-components';
import { Link, NavLink, useLocation } from 'react-router-dom';

import HamburgerMenu from './HamburgerMenu';
import Search from './Search';
import icon from '../../assets/icon.svg';
import RankingIcon from '../../assets/svgComponents/ranking';
import ActivityIcon from '../../assets/svgComponents/activity';
import UploadIcon from '../../assets/svgComponents/upload';
import MyMemesIcon from '../../assets/svgComponents/myMemes';

const Main = styled.header`
  width: 100%;
  height: 90px;
  display:flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px;

  @media screen and (min-width: 768px) {
    height: 50px;
  }

  @media screen and (min-width: 1280px) {
    height: 70px;
    border-bottom: 10px solid ${({ theme }) => theme.colors.blue}
  }
`;

const Icon = styled(Link)`
  display: none;
  background: ${({ theme }) => `linear-gradient(to right, ${theme.colors.blue}, ${theme.colors.indigo})`};
  padding: 8px;
  border-radius: 4px;
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
  width: 71%;
  color: ${({ theme }) => theme.colors.blue100};

  @media screen and (min-width: 768px) {
    width: 30%;
  }

  @media screen and (min-width: 1280px) {
    width: 20%;
    max-width: 250px;
  }
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

  @media screen and (min-width: 768px) {
    width: 50%;
    padding-top: 0;
  }

  @media screen and (min-width: 1280px) {
    justify-content: flex-start;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.gray};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .icon {
    display: none;
  }

  &.active {
    color: ${({ theme }) => theme.colors.blue};
  }

  @media screen and (min-width: 1280px) {
    justify-content: space-between;
    height: 45px;
    margin: 0 16px;

    .icon {
      display: block;
    }
  }
`;

const CustomSearch = styled(Search)`
  @media screen and (min-width: 768px) {
    order: 1
  }
`;

const AppBar: React.FC<{}> = () => {
  const location = useLocation();
  return <Main>
    <CustomHamburgerMenu />
    <Icon to="/">
      <img src={icon} alt="MoTD" />
    </Icon>
    <Title>Meme of the Day</Title>
    <CustomSearch />
    <Nav>
      <StyledNavLink exact to='/'>
        <RankingIcon className='icon' active={location.pathname === '/'} />
        Rankings
      </StyledNavLink>
      <StyledNavLink to='/activity'>
        <ActivityIcon className='icon' active={location.pathname === '/activity'} />
        Activity
      </StyledNavLink>
      <StyledNavLink to='/upload'>
        <UploadIcon className='icon' active={location.pathname === '/upload'} />
        Upload
      </StyledNavLink>
      <StyledNavLink to='/me'>
        <MyMemesIcon className='icon' active={location.pathname === '/me'} />
        My Memes
      </StyledNavLink>
    </Nav>
  </Main>;
}

export default AppBar;