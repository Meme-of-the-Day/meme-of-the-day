import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import Button from './Button';
import voteIcon from '../assets/vote.svg';
import bidIcon from '../assets/bid.svg';
import favoriteIcon from '../assets/favorite.svg';

type IMeme = {
  owner: string,
  ipfsHash: string,
  votes: number,
}

interface Props {
  hash: string;
  contract: any;
  index: number;
  className?: string;
}

const Main = styled.div`
  & > img {
    width: 100%;
    min-height: 300px;
    max-height: 300px;
    object-fit: contain;
    border: 1px solid ${({ theme }) => theme.colors.gray50};
    padding: 30px 20px;
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

const VoteCount = styled.span`
  color: ${({ theme }) => theme.colors.black};
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Meme: React.FC<Props> = ({ hash, contract, index, className }) => {
  const [memeData, setMemeData] = useState<IMeme>({
    owner: '',
    ipfsHash: '',
    votes: 0,
  });
  console.log(memeData);
  useEffect(() => {
    const getMemeData = async () => {

      const ipfsHash = await contract.methods.getMemeByIndex(index).call()
      const votes = await contract.methods.getVotes(hash).call()

      setMemeData({
        owner: hash,
        ipfsHash,
        votes: parseInt(votes),
      });
    }

    getMemeData();
  }, []);

  const vote = () => {
    if (window.confirm("Owner of this meme is:\n" + memeData.owner + "\n\nWould you like to vote for this Meme?")) {
      console.log('ok');
      setMemeData({ ...memeData, votes: memeData.votes + 1 });
    }
  }

  const bid = () => {
    if (window.confirm("Owner of this meme is:\n" + memeData.owner + "\n\nWould you like to bid for this Meme?")) {
      console.log('ok');
    }
  }

  const favorite = () => {
    if (window.confirm("Owner of this meme is:\n" + memeData.owner + "\n\nWould you like to favorite this Meme?")) {
      console.log('ok');
    }
  }

  return (
    <Main className={className}>
      <img src={`https://ipfs.infura.io/ipfs/${memeData.ipfsHash}`} alt="" />
      <Meta>
        <VoteCount>Votes: {memeData.votes}</VoteCount>
        <Buttons>
          <Button text='Vote' icon={voteIcon} onClick={() => vote()} />
          <Button text='Bid' icon={bidIcon} onClick={() => bid()} />
          <Button text='Favorite' icon={favoriteIcon} onClick={() => favorite()} />

        </Buttons>
      </Meta>
    </Main>
  )
}

export default Meme;