import React from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

import Button from './Button';
import voteIcon from '../assets/vote.svg';
import bidIcon from '../assets/bid.svg';
import favoriteIcon from '../assets/favorite.svg';
import { MemeMetadata } from '../utils/Types';

type IMeme = {
  owner: string,
  ipfsHash: string,
  votes: number,
}

interface Props {
  meme: MemeMetadata
  className?: string
}

const Main = styled.div`
  display: flex;
  flex-direction: column;

  & > img {
    height: 300px;
    max-height: 300px;
    object-fit: contain;
    border: 1px solid ${({ theme }) => theme.colors.gray50};
    padding: 30px 20px;
    flex: 1;

    @media screen and (min-width: 768px) {
      width: calc(100% - 100px);
    }
  }

  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-start;
    padding: 8px;
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  @media screen and (min-width: 768px) {
    justify-content: flex-start;
    max-width: 100px;
    padding-left: 5px;
  }
`;

const VoteCount = styled.span`
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 8px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const CustomButton = styled(Button)`
  margin: 4px 0px;
`;

const Date = styled.div`
  color: ${({theme}) => theme.colors.gray};
  font-size: 12px;

  strong {
    font-size: 14px;
  }
`;

const Meme: React.FC<Props> = ({ className, meme }) => {
  console.log(meme);
  const vote = () => {
    if (window.confirm("Owner of this meme is:\n" + meme.owner + "\n\nWould you like to vote for this Meme?")) {
      if (meme.likes) {
        meme.likes += 1;
      } else {
        meme.likes = 1;
      }
    }
  }

  const bid = () => {
    if (window.confirm("Owner of this meme is:\n" + meme.owner + "\n\nWould you like to bid for this Meme?")) {
    }
  }

  const favorite = () => {
    if (window.confirm("Owner of this meme is:\n" + meme.owner + "\n\nWould you like to favorite this Meme?")) {
    }
  }

  return (
    <Main className={`${className} MemeOfTheDay`}>
      <img src={`https://hub.textile.io/ipfs/${meme.cid}`} alt="" />
      <Meta>
        <VoteCount>Votes: {meme.likes}</VoteCount>
        <Buttons>
          <CustomButton text='Vote' icon={voteIcon} onClick={() => vote()} />
          <CustomButton text='Bid' icon={bidIcon} onClick={() => bid()} />
          <CustomButton text='Favorite' icon={favoriteIcon} onClick={() => favorite()} />
          <Date>Minted at:<br /><strong>{dayjs(parseInt(meme.date)).format('DD-MM-YYYY')}</strong></Date>
        </Buttons>
      </Meta>
    </Main>
  )
}

export default Meme;
