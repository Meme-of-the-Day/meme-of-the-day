import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import MemesHandler from '../abis/MemesHandler.json';
import ipfsClient from 'ipfs-http-client';
import { AnyARecord } from 'dns';
// connect to public ipfs daemon API server
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

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
  
  &.open {
    border: 1px solid ${({ theme }) => theme.colors.gray50};
    height: 200px;
  }
`;

const Upload: React.FC<{}> = () => {
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [image, setImage] = useState<string>('');
  const [imageBuffer, setImageBuffer] = useState<ArrayBuffer>();
  const [txDetails, setTxDetails] = useState({});
  const [uploadStatus, setUploadStatus] = useState(UploadStatus.NOT_STARTED);
  const [viewDetails, setViewDetails] = useState(false);
  console.log(txDetails);

  const changeHandler = async (event: React.ChangeEvent) => {
    event.preventDefault()
    // processing file
    if (!(event.target as HTMLInputElement).files) {
      return;
    }

    const file = ((event.target as HTMLInputElement).files as FileList)[0]
    const buffer = await file.arrayBuffer();
    setImageBuffer(buffer);
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setSubmitEnabled(true);
  }

  const uploadMeme = (event: React.FormEvent) => {
    event.preventDefault();

    setSubmitEnabled(false);
    setUploadStatus(UploadStatus.IN_PROGRESS);
    ipfs.add(imageBuffer, async (error: any, result: any) => {
      if (error) {
        console.error(error)
        return
      }

      console.log('Ipfs result', result);
      const memeHash = result[0].hash;
      setTxDetails({ ipfsHash: memeHash });

      console.log("Submitting the form...storing meme on blockchain");
      //storing meme with hash on blockchain
      const web3 = window.web3;
      window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      console.log('Using account in Metamask: ' + accounts[0]);
      console.log('Meme will be stored with account: ' + accounts[0]);

      const networkId = await web3.eth.net.getId();
      console.log('Metamask is connected to: ' + networkId);
      const networkData = MemesHandler.networks[networkId];
      if (networkData) {
        //fetching the contract
        const abi = MemesHandler.abi
        const address = networkData.address
        const contract = new web3.eth.Contract(abi, address)
        contract.methods.newMeme(memeHash).send({ from: accounts[0] }).then((err: any, res: AnyARecord) => {
          console.log('inside of contract function call', res);
          setUploadStatus(UploadStatus.COMPLETED);
        }).catch((error: any) => alert("Something went wrong! Please try again"));
      }
    });
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
                  JSON.stringify(txDetails)
                }
              </TxDetails>
              <CustomLink to="/me">View your memes</CustomLink>
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
