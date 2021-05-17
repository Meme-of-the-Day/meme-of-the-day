import React from "react";
import styled from "styled-components";

const Main = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: ${({ theme }) => theme.colors.purple400};
`;

export default function Rankings() {
  return <Main>Coming Soon...</Main>;
}
