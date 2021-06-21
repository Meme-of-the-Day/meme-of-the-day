import React, { useContext , useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import { torusObject } from '../helper/toruslabs'
import voteIcon from "../assets/vote.svg";
import { MemeMetadata } from "../utils/Types";
import { Textile } from "../utils/textile";
import { AuthContext, UIContextType, UIContext } from "../App";

type IMeme = {
  owner: string;
  ipfsHash: string;
  votes: number;
};

interface Props {
  meme: MemeMetadata;
  className?: string;
  textileInstance: Textile;
}

const Main = styled.div`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  padding: 40px 40px 0;

  & > img {
    height: 300px;
    max-height: 300px;
    object-fit: contain;
    padding: 30px 20px;
    box-shadow: 0 0 2px 0 ${({ theme }) => theme.colors.gray100};
    flex: 1;
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  padding: 10px 40px;
  align-items: center;
  & .active_btn {
    padding: 10px 30px;
    font-size: 16px;
    background: none;
    color: #3867fc;
    border: 2px solid #3867fc;
    border-radius: 8px;
  }
`;

const Buttons = styled.div`
  display: none;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;

  & > img {
    width: 48px;
  }

  @media screen and (min-width: 1000px) {
    display: flex;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Owner = styled.div`
  display: flex;
  align-items: center;
`;

const OwnerImage = styled.div`
  background-color: ${({ theme }) => theme.colors.gray100};
  height: 50px;
  width: 50px;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gray};
  margin-right: 10px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Address = styled.span`
  color: ${({ theme }) => theme.colors.black};
  font-size: 14px;
`;

const MintedOn = styled.span`
  color: ${({ theme }) => theme.colors.gray50};
  font-size: 12px;
`;

const Name = styled.div`
  color: ${({ theme }) => theme.colors.black};
  text-align: right;
  font-size: 16px;
  margin-bottom: 4px;
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


const Meme: React.FC<Props> = ({ className, meme, textileInstance }) => {
  const authContext = useContext(AuthContext);
  const [memesLike, setMemesLike] = useState(meme.likes);
  const [memesActive, setMemesActive] = useState(meme.active);
  const uiContext = useContext<UIContextType>(UIContext);

  const { openModal } = uiContext;

  const {
    hasMetamask,
    isMetamaskConnected,
    isConnectedToMatic,
    authProvider
  } = authContext;

  const vote = async () => {
    if (torusObject) {
      if (torusObject.account) {
        if (
          window.confirm(
            "Owner of this meme is:\n" +
              meme.walletid +
              "\n\nWould you like to vote for this Meme?"
          )
        ) {
           
          // Note : Check owner memes 
          
          if(torusObject.account === meme.owner ){
            window.alert("Vote cannot be added on your meme");
            return
          }
          const isValid = await textileInstance.updateMemeVotes(
            torusObject.account,
            meme._id,
            true,
            true
          );
          if (isValid) {
            if (meme.likes) {
              setMemesLike( meme.likes + 1);
            } else {
              setMemesLike(1);
            }
          } else {
              window.alert("Vote cannot be added twice");
          }
        }
      }else{
        window.alert("Please login first!");
      }
    }else{
      window.alert("Please login first!");
    }
  };


  const active = async () => {
    if (torusObject) {
      if (torusObject.account) {
          // Note : Check owner memes 
          const isValid = await textileInstance.updateMemeActive(
            meme._id,
            memesActive
          );
          if (isValid) {
              if(memesActive){
                setMemesActive(false);
              }else{
                setMemesActive(true);
              }
          }
      }
    } 
  };

  const bid = () => {
    if (
      window.confirm(
        "Owner of this meme is:\n" +
          meme.owner +
          "\n\nWould you like to bid for this Meme?"
      )
    ) {
    }
  };

  const favorite = () => {
    if (
      window.confirm(
        "Owner of this meme is:\n" +
          meme.owner +
          "\n\nWould you like to favorite this Meme?"
      )
    ) {
    }
  };

  let ownerAddress = meme.owner
    ? meme.owner.slice(0, 8) + "..." + meme.owner.slice(-4)
    : "N/A";

  return (
    <Main className={`${className} MemeOfTheDay`}>
      <StyledLink to={`/meme/${meme.cid}`}>
        <Top>
          <Owner>
            <OwnerImage>Owner</OwnerImage>
            <Details>
              <Address>{ownerAddress}</Address>
              <MintedOn>
                Minted on: {dayjs(parseInt(meme.date)).format("DD MMM, YYYY")}
              </MintedOn>
            </Details>
          </Owner>
  
         
        </Top>
        <Name>
          {meme.name.length > 40
            ? meme.name.substring(0, 40) + "..."
            : meme.name}
        </Name>
        <img src={`https://hub.textile.io/ipfs/${meme.cid}`} alt="" />
      </StyledLink>
      <Meta>
        <Buttons>
          <Button onClick={async () => await vote()}>
            <img src={voteIcon} alt="Vote" />
            <Count>{memesLike}</Count>
          </Button>
        </Buttons>
        {meme.owner === torusObject.account? 
          <div>
              <button className="active_btn" onClick={async () => await active()}>{memesActive ? "Un-Publish": "Publish"}</button>
          </div>
          : ""}
      </Meta>
             {/* Note : Active Deactive Memes */}
             
    </Main>
  );
};

export default Meme;
