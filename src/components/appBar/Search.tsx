import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import search from "../../assets/search.svg";

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  overflow: hidden;

  @media screen and (min-width: 1280px) {
    height: 35px;
  }
`;

const SearchIcon = styled.img`
  width: 15px;
`;

const SearchForm = styled.form`
  background-color: ${({ theme }) => theme.colors.purple100};
  display: flex;
  align-items: center;
  transition: width 0.25s ease-out;
  justify-content: space-between;
  padding: 4px 8px;
  width: 100%;

  input {
    height: 100%;
    width: calc(100% - 40px);
    border: none;
    background: none;
    flex: 1;

    &::placeholder {
      font-size: 8px;
      color: ${({ theme }) => theme.colors.purple200};
    }
  }

  @media screen and (min-width: 1280px) {
    input {
      width: calc(100% - 20px);
      padding-left: 4px;
    }
  }
`;

const Search: React.FC<{ className?: string }> = ({ className }) => {
  const history = useHistory();

  const submitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const { q } = event.target as HTMLFormElement;

    history.push(`/search?q=${q.value}`);
  };

  return (
    <Main className={className}>
      <SearchForm onSubmit={submitHandler}>
        <SearchIcon src={search} alt="Search" />
        <input
          name="q"
          type="text"
          placeholder="Search memes, addresses, transactions"
        />
      </SearchForm>
    </Main>
  );
};

export default Search;
