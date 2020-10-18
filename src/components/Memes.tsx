import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Meme from './Meme';
import { Textile } from '../utils/textile';
import { MemeMetadata } from '../utils/Types'

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const CustomMeme = styled(Meme)`
  margin: 8px 0;
  width: 100%;

  @media screen and (min-width: 768px) {
    width: 48%;
  }

  @media screen and (min-width: 1280px) {
    width: 30%;
  }
`;

const Memes: React.FC<{}> = () => {
  const [memeMetadata, setMemeMetadata] = useState<Array<MemeMetadata>>([]);

  useEffect(() => {
    const init = async () => {
      const textile = await Textile.getInstance();
      const memes = await textile.getAllMemes();
      setMemeMetadata(memes);
    }
    init();
  }, []);

  return (
    <Main>
      {
        memeMetadata && memeMetadata.map((meme, index) => <CustomMeme meme={meme} />)
      }
    </Main>
  )
}

export default Memes;
