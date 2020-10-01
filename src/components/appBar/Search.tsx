import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

import search from '../../assets/search.svg';

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const SearchIcon = styled.img`
  width: 25px;

  &.mobile-only {
    @media screen and (min-width: 1280px) {
      display: none;
    }
  }

  &.form-icon {
    width: 20px;
  }
`;

const SearchForm = styled.form`
  width: 0;
  overflow: hidden;
  height: 45px;
  background-color: ${({ theme }) => theme.colors.gray100};
  display: flex;
  align-items: center;
  transition: width 0.25s ease-out;
  position: fixed;
  justify-content: space-between;

  input {
    height: 100%;
    width: calc(100% - 40px);
    border: none;
    background: none;
  }

  &.open {
    z-index: 2;
    position: fixed;
    top: 0;
    right: 0;
    width: 100vw;
    padding: 10px;
  }

  @media screen and (min-width: 1280px) {
    width: 300px;
    padding: 0 8px;
    border-radius: 20px;
    position: static;
    height: 40px;

    input {
      width: calc(100% - 20px);
      padding-left: 4px;
    }
  }
`;

const Close = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.gray};

  @media screen and (min-width: 1280px) {
    display: none;
  }
`;

const Search: React.FC<{ className?: string }> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const history = useHistory();

  const submitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const { q } = event.target as HTMLFormElement;

    history.push(`/search?q=${q.value}`);
  };

  return (
    <Main className={`${open ? 'open' : ''} ${className}`}>
      <SearchIcon className="mobile-only" src={search} alt="Search" onClick={() => setOpen(true)} />
      <SearchForm className={open ? 'open' : ''} onSubmit={submitHandler}>
        <SearchIcon className="form-icon" src={search} alt="Search" />
        <input name="q" type='text' placeholder="Search memes, addresses, transactions" />
        <Close onClick={() => setOpen(false)}><span>&times;</span></Close>
      </SearchForm>
    </Main>
  )
}

export default Search;