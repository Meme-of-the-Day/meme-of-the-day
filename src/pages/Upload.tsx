import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { Contract } from "web3-eth-contract";
import { TransactionReceipt } from "web3-eth";
import { SignedTransaction } from "web3-core";

import { AuthContext } from "../App";
import { Textile } from "../utils/textile";
import { MemeMetadata } from "../utils/Types";
import {
  NetworkIDToAddress,
  NetworkIDToExplorer,
  NetworkIDToSaleContract
} from "../utils/Contracts";
import { AuthProvider } from "../utils/UserAuth";
import UploadModal from "../components/UploadModal";

const MemeSale = require("../contracts/abis/MemeSale.json");
const MemesHandler = require("../contracts/abis/MemeOfTheDay.json");

enum UploadStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2
}

const Main = styled.div`
  padding: 20px;
  overflow: auto;
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

const Upload: React.FC<{}> = () => {
  let authContext = useContext(AuthContext);

  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [image, setImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File>();
  const [txDetails, setTxDetails] = useState({});
  const [uploadStatus, setUploadStatus] = useState(UploadStatus.NOT_STARTED);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [meme, setMeme] = useState<MemeMetadata>();
  const [networkId, setNetworkId] = useState<number>();

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

  const signMessage = function(meme: MemeMetadata): Promise<string> {
    const sellerSetPriceTypedData = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        VerifyPrice: [
          { name: "tokenId", type: "uint256" },
          { name: "price", type: "uint256" }
        ]
      },
      domain: {
        name: "MemeSale",
        version: "1",
        chainId: 3431,
        verifyingContract: NetworkIDToSaleContract[networkId as number]
      },
      primaryType: "VerifyPrice",
      message: {
        tokenId: meme.tokenID,
        price: meme.price
      }
    });

    return new Promise((resolve, reject) => {
      if (authContext && authContext.authProvider) {
        const from = authContext.authProvider?.account;
        const params = [from, sellerSetPriceTypedData];
        const method = "eth_signTypedData_v4";

        // @ts-ignore
        authContext.authProvider?.web3.currentProvider.sendAsync(
          {
            method,
            params,
            from
          },
          async (err: any, result: any) => {
            console.log(result.result);

            const abi = MemeSale.abi;

            const contract = new (authContext.authProvider as AuthProvider).web3.eth.Contract(
              abi,
              NetworkIDToSaleContract[networkId as number]
            );

            const textile = await Textile.getInstance();

            await contract.methods
              .putOnSale(meme.tokenID)
              .call({ from: authContext.authProvider?.account })
              .then(() => {
                console.log("Put on sale completed");
              });
            const newMeme = {
              ...meme,
              sellApprovalSignature: result.result
            };
            setMeme(newMeme);

            await textile.updateMemeMetadata(newMeme);

            setUploadStep(uploadStep + 1);
            resolve(result.result as string);
          }
        );
      } else {
        reject();
      }
    });
  };

  const getSellerApproval = async (meme: MemeMetadata) => {
    const abi = MemesHandler.abi;

    if (authContext.authProvider) {
      let contractAddress: string;

      if (networkId === 137) {
        contractAddress = NetworkIDToAddress[137];
      } else if (networkId === 80001) {
        contractAddress = NetworkIDToAddress[80001];
      } else if (networkId === 3431) {
        contractAddress = NetworkIDToAddress[3431];
      } else {
        throw new Error("chain not supported");
      }

      const contract = new authContext.authProvider.web3.eth.Contract(
        abi,
        contractAddress
      );
      return await contract.methods
        //second paramenter is creator fee, using 0% for now
        .setApprovalForAll(NetworkIDToSaleContract[networkId as number], true)
        .send({ from: authContext.authProvider?.account })
        .then(() => {
          setUploadStep(uploadStep + 1);
        });
    }
  };

  const uploadMeme = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!authContext.authProvider) {
      window.alert("Please login before uploading");
      return;
    }

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
    const form = event.target;

    let memePrice: number = parseInt(price);

    if (isNaN(memePrice)) {
      memePrice = 0;
    }

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

    setShowUploadModal(true);

    const textile = await Textile.getInstance();

    const meme =
      imageFile && (await textile.uploadMeme(imageFile, memeName, description));

    if (meme && authContext.authProvider) {
      console.log("Meme cid:", meme.cid);
      setTxDetails({ ipfsHash: meme.cid });

      console.log("Submitting the form...storing meme on blockchain");

      //let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      //const accounts = await uiContext.authProvider.web3.eth.requestAccounts();
      console.log(
        "Using account in Metamask: " + authContext.authProvider?.account
      );
      console.log(
        "Meme will be stored with account: " + authContext.authProvider?.account
      );

      let contractAddress: string;
      let blockExplorerURL: string;

      if (networkId === 137) {
        contractAddress = NetworkIDToAddress[137];
        blockExplorerURL = NetworkIDToExplorer[137];
      } else if (networkId === 80001) {
        contractAddress = NetworkIDToAddress[80001];
        blockExplorerURL = NetworkIDToExplorer[80001];
      } else if (networkId === 3431) {
        contractAddress = NetworkIDToAddress[3431];
      } else {
        throw new Error("chain not supported");
      }

      const abi = MemesHandler.abi;

      const contract = new authContext.authProvider.web3.eth.Contract(
        abi,
        contractAddress
      );

      contract.methods
        //second paramenter is creator fee, using 0% for now
        .mint(meme.cid, 0)
        .send({ from: authContext.authProvider?.account })
        .on("error", async function(error: any) {
          console.log(error);
          await textile.deleteMemeFromBucket(meme);
        })
        .then(async function(receipt: TransactionReceipt) {
          console.log("Mint tx:", receipt);

          setTxDetails({
            ...txDetails,
            "IPFS Hash": meme.cid,
            "Transaction Hash": {
              isLink: true,
              link: `${blockExplorerURL}tx/${receipt.transactionHash}`,
              text: receipt.transactionHash
            }
          });

          contract.methods
            //second paramenter is creator fee, using 0% for now
            .getTokenID(meme.cid)
            .call({ from: authContext.authProvider?.account })
            .then(async function(result: any) {
              let memeUpdated: MemeMetadata = {
                ...meme,
                txHash: receipt.transactionHash,
                owner: authContext.authProvider?.account,
                tokenID: result,
                name: memeName,
                description: description,
                onSale: onSale,
                price: memePrice
              };

              setMeme(memeUpdated);
              if (onSale) {
                setUploadStep(uploadStep + 1);
              } else {
                setUploadStep(4);
              }

              await textile.uploadTokenMetadata(memeUpdated);

              await textile.uploadMemeMetadata(memeUpdated);

              setUploadStatus(UploadStatus.COMPLETED);
              (form as HTMLFormElement).reset();
              setImage("");
            })
            .catch("error", async function(error: any) {
              console.log(error);
              await textile.deleteMemeFromBucket(meme);
              alert("Something went wrong! Please try again");
              setUploadStatus(UploadStatus.NOT_STARTED);
              setUploadStep(1);
              setShowUploadModal(false);
            });

          (window as any).onbeforeunload = function() {};
        })
        .catch(async (error: any) => {
          console.log(error);
          setUploadStatus(UploadStatus.NOT_STARTED);
          setUploadStep(1);
          setShowUploadModal(false);
          alert("Something went wrong! Please try again");
          await textile.deleteMemeFromBucket(meme);
          (window as any).onbeforeunload = function() {};
        });
    }
  };

  const deleteMeme = async () => {
    const textile = await Textile.getInstance();
    await textile.deleteMemeFromBucket(meme as MemeMetadata);
  };

  useEffect(() => {
    (async () => {
      const networkId = await authContext.authProvider?.web3.eth.net.getId();
      setNetworkId(networkId);
      console.log("Metamask is connected to: " + networkId);
    })();

    return () => {
      (window as any).onbeforeunload = function() {};
    };
  }, [authContext.authProvider]);

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
        </Inputs>
        <Preview>
          Preview
          <Image>{image && <img src={image} alt="" />}</Image>
        </Preview>
      </UploadForm>
      {showUploadModal && (
        <UploadModal
          step={uploadStep}
          signMessage={() => signMessage(meme as MemeMetadata)}
          getSellerApproval={() => getSellerApproval(meme as MemeMetadata)}
          txDetails={txDetails}
          closeModal={() => setShowUploadModal(false)}
          dismiss={() => deleteMeme()}
        />
      )}
    </Main>
  );
};

export default Upload;
