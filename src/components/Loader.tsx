import React from "react";
import styled, { keyframes } from "styled-components";

const ring = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Main = styled.div`
  display: inline-block;
  width: 80px;
  height: 80px;
  margin: auto;

  &::after {
    content: " ";
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent ${({ theme }) => theme.colors.blue}
      transparent;
    animation: ${ring} 1.2s linear infinite;
  }
`;

const Small = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  margin: auto;

  &::after {
    content: " ";
    display: block;
    width: 36px;
    height: 36px;
    margin: 4px 0;
    border-radius: 50%;
    border: 3px solid #fff;
    border-color: #fff transparent ${({ theme }) => theme.colors.blue}
      transparent;
    animation: ${ring} 1.2s linear infinite;
  }
`;

const Loader: React.FC<{ isSmall?: boolean }> = ({ isSmall }) => {
  if (isSmall) {
    return <Small />;
  }
  return <Main />;
};

export default Loader;
