import React from 'react';
import styled from 'styled-components';

import Memes from '../components/Memes';

const Main = styled.div`
  padding: 16px;
`;

const Home: React.FC<{}> = () => {
  return <Main>
    <Memes />
  </Main>;
}

export default Home;