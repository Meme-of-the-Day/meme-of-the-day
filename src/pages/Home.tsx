import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import Meme from '../components/Meme';
import Loader from '../components/Loader';
import { Textile } from '../utils/textile';
import { MemeMetadata } from '../utils/Types'

const Main = styled.div`
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex: 1;

  @media screen and (min-width: 1280px) {
    justify-content: flex-start;
  }
`;

const CustomMeme = styled(Meme)`
  margin: 8px 0;
  width: 100%;

  @media screen and (min-width: 768px) {
    width: 48%;
  }

  @media screen and (min-width: 1280px) {
    width: 33%;
  }
`;

const Home: React.FC<{}> = () => {
  const [memeMetadata, setMemeMetadata] = useState<Array<MemeMetadata>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const textile = await Textile.getInstance();
      const memes = await textile.getAllMemes();
      setMemeMetadata(memes);
      setLoading(false);
    }
    init();
  }, []);

  return (
    <Main>
      {
        loading && 
        <Loader />
      }
      {
        memeMetadata && memeMetadata.map((meme) => <CustomMeme meme={meme} key={meme.cid} />)
      }
    </Main>
  )
}

export default Home;