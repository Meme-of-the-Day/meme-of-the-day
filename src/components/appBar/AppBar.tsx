import React from 'react';
import styled from 'styled-components';

import HamburgerMenu from './HamburgerMenu';
import search from '../../assets/search.svg';

const Main = styled.div`
  width: 100%;
  height: 90px;
  display:flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px;
`;

const Title = styled.span`
  font-size: 28px;
  margin: 0 16px;
  width: 74%;
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

const AppBar: React.FC<{}> = () => {
  return <Main>
    <HamburgerMenu />
    <Title>Meme of the Day</Title>
    <SearchIcon src={search} alt="Search" />
    <Nav>
      <div>Rankings</div>
      <div>Activity</div>
      <div>Upload</div>
      <div>My Memes</div>
    </Nav>
  </Main>;
}

export default AppBar;