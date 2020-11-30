import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Textile } from "../utils/textile";
import { NetworkIDToAddress } from "../utils/Contracts";
import Web3 from "web3";
const MemesHandler = require("../abis/MemeOfTheDay.json");

enum UploadStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2
}

const Main = styled.div`
  padding: 20px;
`;

const Title = styled.p`
  font-size: 26px;
`;

const UploadForm = styled.form`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media screen and (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    padding: 0 30px;
  }
`;

const Label = styled.label`
  border: 1px solid ${({ theme }) => theme.colors.black};
  padding: 15px;
  color: ${({ theme }) => theme.colors.black};
  width: 170px;
  text-align: center;
  border-radius: 8px;
`;

const SubmitButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.black};
  padding: 20px 30px;
  color: ${({ theme }) => theme.colors.black};
  width: 250px;
  text-align: center;
  margin: 24px 0;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 18px;

  &:disabled {
    border: 1px solid ${({ theme }) => theme.colors.black};
    background-color: ${({ theme }) => theme.colors.gray100};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  margin-right: 20px;
  width: 100%;

  @media screen and (min-width: 768px) {
    width: 30%;
  }
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

const Message = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray50};
  margin-top: 4px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 20px 0;

  label {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: 5px;
  }

  input {
    appearance: none;
    border: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.black};
    font-size: 14px;
    background: none;
  }

  textarea {
    border: 1px solid ${({ theme }) => theme.colors.black};
    padding: 10px;
  }

  textarea,
  input {
    &::placeholder {
      color: ${({ theme }) => theme.colors.gray50};
    }
    &.dark-placeholder {
      &::placeholder {
        color: ${({ theme }) => theme.colors.black};
      }
    }
  }

  .input-container {
    width: 100%;
    input {
      width: 80%;
    }
  }
`;

const Switch = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  /* The switch - the box around the slider */
  .switch {
    margin-left: 4px;
    position: relative;
    display: inline-block;
    width: 30px;
    height: 15px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #dde9fd;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 10px;
    width: 10px;
    left: 4px;
    bottom: 3px;
    background-color: ${({ theme }) => theme.colors.blue};
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  input:checked + .slider:before {
    transform: translateX(12px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
`;

type DetailsObject = {
  isLink?: boolean;
  link?: string;
  text?: string;
};

const renderDetails = (value: string | DetailsObject) => {
  switch (typeof value) {
    case "string":
      return value;
    case "object":
      if (value.isLink) {
        return (
          <a target="_blank" rel="noopener noreferrer" href={value.link}>
            {value.text || value.link}
          </a>
        );
      }
      return null;
    default:
      return null;
  }
};

const Upload: React.FC<{}> = () => {
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [image, setImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File>();
  const [txDetails, setTxDetails] = useState({});
  const [uploadStatus, setUploadStatus] = useState(UploadStatus.NOT_STARTED);
  const [viewDetails, setViewDetails] = useState(false);

  const changeHandler = async (event: React.ChangeEvent) => {
    event.preventDefault();
    // processing file
    if (!(event.target as HTMLInputElement).files) {
      return;
    }

    const file = ((event.target as HTMLInputElement).files as FileList)[0];
    if (file.size > 3072000) {
      alert("Please upload an image that has a max size of 3 MB");
      return;
    }
    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setSubmitEnabled(true);
  };

  const uploadMeme = async (event: React.FormEvent) => {
    event.preventDefault();

    setSubmitEnabled(false);
    setUploadStatus(UploadStatus.IN_PROGRESS);

    (window as any).onbeforeunload = function() {
      return "Are you sure you want to navigate away?";
    };

    const {
      memeName: { value: memeName },
      description: { value: description },
      onSale: { checked: onSale },
      price: { value: price }
    } = event.target as HTMLFormElement;

    if (!memeName) {
      alert("Please enter a name for your meme");
      setUploadStatus(UploadStatus.NOT_STARTED);
      setSubmitEnabled(true);
      return;
    }

    if (onSale && !price) {
      alert("Please enter a price for your meme");
      setUploadStatus(UploadStatus.NOT_STARTED);
      setSubmitEnabled(true);
      return;
    }
    debugger;

    const textile = await Textile.getInstance();

    const meme = imageFile && (await textile.uploadMeme(imageFile));

    if (meme) {
      console.log(meme.cid);
      setTxDetails({ ipfsHash: meme.cid });

      console.log("Submitting the form...storing meme on blockchain");

      let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      console.log("Using account in Metamask: " + accounts[0]);
      console.log("Meme will be stored with account: " + accounts[0]);

      const networkId = await web3.eth.net.getId();
      console.log("Metamask is connected to: " + networkId);

      let contractAddress: string;

      if (networkId === 137) {
        contractAddress = NetworkIDToAddress[137];
      } else if (networkId === 80001) {
        contractAddress = NetworkIDToAddress[80001];
      } else {
        throw new Error("chain not supported");
      }

      const abi = MemesHandler.abi;

      const contract = new web3.eth.Contract(abi, contractAddress);

      contract.methods
        .mint(meme.cid)
        .send({ from: accounts[0] }, async (error: any, txHash: string) => {
          setTxDetails({
            ...txDetails,
            "IPFS Hash": meme.cid,
            "Transaction Hash": {
              isLink: true,
              link: `https://mumbai-explorer.matic.today/tx/${txHash}`,
              text: txHash
            }
          });
          await textile.uploadMemeMetadata({
            ...meme,
            txHash: txHash,
            owner: accounts[0],
            name: memeName,
            description,
            onSale,
            price
          });
          setUploadStatus(UploadStatus.COMPLETED);
        })
        .catch((error: any) => {
          alert("Something went wrong! Please try again");
          setUploadStatus(UploadStatus.NOT_STARTED);
        });
    }
  };

  return (
    <Main>
      <Title>Upload Your Meme Collectible</Title>

      <UploadForm onSubmit={uploadMeme}>
        <Inputs>
          <input
            type="file"
            name="meme"
            id="meme"
            hidden
            onChange={changeHandler}
            accept=".png,.jpg,.jpeg,.gif,.svg"
          />
          <Label htmlFor="meme">Select Image File</Label>
          <Message>JPG, PNG, GIF or SVG. 3 MB max</Message>
          <Field>
            <label htmlFor="memeName">Name</label>
            <input name="memeName" type="text" placeholder="Your meme's name" />
          </Field>
          <Field>
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              placeholder="More details (optional)"
              rows={5}
            />
          </Field>
          <Switch>
            Put on sale?
            <label className="switch">
              <input name="onSale" type="checkbox" />
              <span className="slider round"></span>
            </label>
          </Switch>
          <Field>
            <label htmlFor="price">Sale Price</label>
            <div className="input-container">
              <input
                name="price"
                placeholder="0"
                className="dark-placeholder"
                type="number"
              />
              MATIC
            </div>
          </Field>
          <SubmitButton disabled={!submitEnabled} type="submit">
            Upload and Mint NFT
          </SubmitButton>
          {uploadStatus === UploadStatus.IN_PROGRESS && <em>Uploading...</em>}
          {uploadStatus === UploadStatus.COMPLETED && (
            <em>Uploaded Successfully!</em>
          )}
          {uploadStatus === UploadStatus.COMPLETED && (
            <ViewDetails>
              <span
                className="btn"
                onClick={() => setViewDetails(!viewDetails)}
              >
                View transaction details
              </span>
              <TxDetails className={viewDetails ? "open" : ""}>
                {Object.keys(txDetails).map(key => {
                  return (
                    <DetailDiv>
                      <em>{key}</em>: {renderDetails(txDetails[key])}
                    </DetailDiv>
                  );
                })}
              </TxDetails>
              <CustomLink to="/me">View your memes</CustomLink>
            </ViewDetails>
          )}
        </Inputs>
        <Preview>
          Preview
          <Image>{image && <img src={image} alt="" />}</Image>
        </Preview>
      </UploadForm>
    </Main>
  );
};

export default Upload;
