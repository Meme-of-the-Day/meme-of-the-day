import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import Meme from '../components/Meme';
import Loader from '../components/Loader';
import { Textile } from '../utils/textile';
import { MemeMetadata } from '../utils/Types'
import Web3 from 'web3';

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

const NoMemesMsg = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 15%;
  margin: auto;
`;

const CustomLink = styled(Link)`
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.black};
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.black};
  padding: 10px 20px;
`;

const MyMemes: React.FC<{}> = () => {
  const [memeMetadata, setMemeMetadata] = useState<Array<MemeMetadata>>([]);
  const [textileInstance, setTextile] = useState<Textile>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const textile = await Textile.getInstance();

      // Ask the user to connect their wallet
      let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      await web3.eth.requestAccounts();

      const connectedAccount = await web3.eth.getAccounts();
      console.log(connectedAccount);
      const memes = await textile.getUserMemes(connectedAccount[0]);
      setMemeMetadata(memes);
      setTextile(textile);
      setLoading(false);
    }
    init();
  }, []);

  return (
    <Main>
      {
        loading ? 
        <Loader /> :
        memeMetadata.length > 0 && textileInstance ? memeMetadata.map((meme) => <CustomMeme meme={meme} textileInstance={textileInstance} key={meme.cid} />) :
        <NoMemesMsg>
          <span>You haven't uploaded any memes.</span>
          <CustomLink to="/upload">Upload a meme</CustomLink>
        </NoMemesMsg>
      }
    </Main>
  )
}

export default MyMemes;