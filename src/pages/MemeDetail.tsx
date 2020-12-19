import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";

import { AuthContext, UIContext, UIContextType } from "../App";
import { Textile } from "../utils/textile";
import voteIcon from "../assets/vote.svg";
import { MemeMetadata } from "../utils/Types";

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  overflow: auto;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    max-width: 800px;
    margin: 20px auto 0;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const ImageContainer = styled.div`
  width: 100%;

  & > img {
    width: 100%;
  }

  @media screen and (min-width: 768px) {
    width: 70%;

    & > img {
      padding: 20px;
      width: 100%;
      border: 1px solid ${({ theme }) => theme.colors.purple100};
    }
  }
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media screen and (min-width: 768px) {
    justify-content: flex-end;
    width: 30%;
  }
`;

const Buttons = styled.div`
  display: none;
  align-items: center;
  width: 100%;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.purple100};

  & > img {
    width: 48px;
  }

  @media screen and (min-width: 768px) {
    border-bottom: none;
  }
  @media screen and (min-width: 1000px) {
    display: flex;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  cursor: pointer;
`;

const Count = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.purple200};
  margin-left: 4px;
  font-weight: bold;
`;

const Name = styled.h3`
  width: 100%;
  margin-bottom: 4px;
  padding: 0 8px;
  font-size: 30px;
`;

const Price = styled.div`
  font-size: 12px;
  width: 100%;
  padding: 0 8px;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.gray};
`;

const Description = styled.p`
  width: 100%;
  padding: 0 8px;
`;

const Owner = styled.div`
  width: 100%;
  padding: 0 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray};
`;

const MintedOn = styled.div`
  font-size: 12px;
  width: 100%;
  color: ${({ theme }) => theme.colors.gray50};
  padding: 0 8px;
`;

export default function MemeDetail() {
  const { cid } = useParams();
  const authContext = useContext(AuthContext);
  const [meme, setMeme] = useState<MemeMetadata>();

  const uiContext = useContext<UIContextType>(UIContext);

  const { openModal } = uiContext;

  const {
    hasMetamask,
    isMetamaskConnected,
    isConnectedToMatic,
    authProvider
  } = authContext;

  useEffect(() => {
    (async () => {
      const textile = await Textile.getInstance();
      const meme = await textile.getMemeMetadata(cid);
      setMeme(meme);
    })();
  }, []);

  const vote = async () => {
    if (!hasMetamask || !isMetamaskConnected || !isConnectedToMatic) {
      openModal();
    } else {
      if (authContext.authProvider && meme) {
        if (
          window.confirm(
            "Owner of this meme is:\n" +
              meme.owner +
              "\n\nWould you like to vote for this Meme?"
          )
        ) {
          const textile = await Textile.getInstance();
          const isValid = await textile.updateMemeVotes(
            authContext.authProvider.account,
            meme.cid,
            true,
            true
          );
          if (isValid) {
            if (meme.likes) {
              meme.likes += 1;
            } else {
              meme.likes = 1;
            }
          } else {
            window.alert("Vote cannot be added twice");
          }
        }
      }
    }
  };

  let ownerAddress;
  if (meme) {
    ownerAddress = meme.owner
      ? meme.owner.slice(0, 8) + "..." + meme.owner.slice(-4)
      : "N/A";
  }

  return (
    <Main>
      <ImageContainer>
        <img src={`https://hub.textile.io/ipfs/${cid}`} />
        {meme && (
          <>
            <Buttons>
              <Button onClick={async () => await vote()}>
                <img src={voteIcon} alt="Vote" />
                <Count>{meme.likes}</Count>
              </Button>
            </Buttons>
            <MintedOn>
              Minted on: {dayjs(parseInt(meme.date)).format("DD MMM, YYYY")}
            </MintedOn>
          </>
        )}
      </ImageContainer>
      {meme && (
        <>
          <Meta>
            <Name>
              {meme.name.length > 40
                ? meme.name.substring(0, 40) + "..."
                : meme.name}
            </Name>
            <Price>Current Price: {meme.price} MATIC</Price>
            {meme.description && <Description>{meme.description}</Description>}
            <Owner>Owner: {ownerAddress}</Owner>
          </Meta>
        </>
      )}
    </Main>
  );
}
