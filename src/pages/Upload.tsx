import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Textile } from '../utils/textile';
import Web3 from 'web3';
const MemesHandler = require('../abis/MemeOfTheDay.json');

enum UploadStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

const Main = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.p`
  font-size: 26px;
`;

const UploadForm = styled.form`
  margin-top: 50px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  border: 1px solid ${({ theme }) => theme.colors.black};
  padding: 15px 30px;
  color: ${({ theme }) => theme.colors.black};
  width: 220px;
  text-align: center;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.black};
  padding: 15px 30px;
  color: ${({ theme }) => theme.colors.black};
  width: 220px;
  text-align: center;
  margin: 24px 0;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 16px;

  &:disabled {
    border: 1px solid ${({ theme }) => theme.colors.gray100};
    color: ${({ theme }) => theme.colors.gray100};
  }
`;

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  margin-right: 20px;
`;

const Preview = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;

  @media screen and (min-width: 768px) {
    margin-top: 0;
  }
`;

const Image = styled.div`
  height: 300px;
  width: 250px;
  border: 1px solid ${({ theme }) => theme.colors.gray50};

  & > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }
`;

const ViewDetails = styled.div`
  width: 100%;
  line-height: 1.5em;
  cursor: pointer;

  .btn {
    font-size: 14px;
    text-decoration: underline;
  }
`;

const CustomLink = styled(Link)`
  text-decoration: underline;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.black};
`;

const TxDetails = styled.div`
  height: 0;
  overflow: hidden;
  transition: height 0.5s ease-out;
  width: 400px;
  word-break: break-word;

  &.open {
    border: 1px solid ${({ theme }) => theme.colors.gray50};
    height: 200px;
    padding: 10px;
  }
`;

const DetailDiv = styled.div`
  word-break: break-all;
  margin: 10px 0;
`;

type DetailsObject = {
  isLink?: boolean,
  link?: string,
  text?: string,
};

const renderDetails = (value: string | DetailsObject) => {
  switch (typeof value) {
    case 'string':
      return value;
    case 'object':
      if (value.isLink) {
        return <a target="_blank" rel="noopener noreferrer" href={value.link}>{value.text || value.link}</a>
      }
      return null;
    default:
      return null;
  }
}

const Upload: React.FC<{}> = () => {
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [image, setImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File>();
  const [txDetails, setTxDetails] = useState({});
  const [uploadStatus, setUploadStatus] = useState(UploadStatus.NOT_STARTED);
  const [viewDetails, setViewDetails] = useState(false);

  const changeHandler = async (event: React.ChangeEvent) => {
    event.preventDefault()
    // processing file
    if (!(event.target as HTMLInputElement).files) {
      return;
    }

    const file = ((event.target as HTMLInputElement).files as FileList)[0];
    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setSubmitEnabled(true);
  }

  const uploadMeme = async (event: React.FormEvent) => {
    event.preventDefault();

    const textile = await Textile.getInstance();

    setSubmitEnabled(false);
    setUploadStatus(UploadStatus.IN_PROGRESS);

    const meme = imageFile && await textile.uploadMeme(imageFile);

    if (meme) {
      console.log(meme.cid);
      setTxDetails({ ipfsHash: meme.cid });

      console.log("Submitting the form...storing meme on blockchain");

      let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      console.log('Using account in Metamask: ' + accounts[0]);
      console.log('Meme will be stored with account: ' + accounts[0]);

      const networkId = await web3.eth.net.getId();
      console.log('Metamask is connected to: ' + networkId);
      const networkData = MemesHandler.networks[networkId];

      if (networkData) {
        //fetching the contract
        const abi = MemesHandler.abi;
        const address = networkData.address
        const contract = new web3.eth.Contract(abi, address)
        //minting the NFT
        contract.methods.mint(meme.cid).send({ from: accounts[0] }, async (error: any, txHash: string) => {
          setTxDetails({ ...txDetails, 'IPFS Hash': meme.cid, 'Transaction Hash': { isLink: true, link: `https://mumbai-explorer.matic.today/tx/${txHash}`, text: txHash } });
          await textile.uploadMemeMetadata({
            ...meme,
            txHash: txHash,
            owner: accounts[0]
          });
          setUploadStatus(UploadStatus.COMPLETED);
        }).catch((error: any) => {
          alert("Something went wrong! Please try again")
          setUploadStatus(UploadStatus.NOT_STARTED);
        });
      }
    }
  };

  return (
    <Main>
      <Title>Upload a Meme</Title>

      <UploadForm onSubmit={uploadMeme}>
        <Inputs>
          <input type="file" name="meme" id="meme" hidden onChange={changeHandler} />
          <Label htmlFor="meme">Select Image File</Label>
          <SubmitButton disabled={!submitEnabled} type="submit">Upload and Mint NFT</SubmitButton>
          {
            uploadStatus === UploadStatus.IN_PROGRESS && <em>Uploading...</em>
          }
          {
            uploadStatus === UploadStatus.COMPLETED && <em>Uploaded Successfully!</em>
          }
          {
            uploadStatus === UploadStatus.COMPLETED &&
            <ViewDetails>
              <span className="btn" onClick={() => setViewDetails(!viewDetails)}>View transaction details</span>
              <TxDetails className={viewDetails ? 'open' : ''}>
                {
                  Object.keys(txDetails).map((key) => {
                    return <DetailDiv>
                      <em>{key}</em>: {renderDetails(txDetails[key])}</DetailDiv>
                  })
                }
              </TxDetails>
              <CustomLink to="/">View your memes</CustomLink>
            </ViewDetails>
          }
        </Inputs>
        <Preview>
          Preview
          <Image>
            {
              image && <img src={image} alt="" />
            }
          </Image>
        </Preview>
      </UploadForm>

    </Main>
  );
}

export default Upload;
