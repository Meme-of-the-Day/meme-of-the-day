import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import MemesHandler from '../abis/MemesHandler.json';
import Meme from './Meme';

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
  const [memeHashes, setMemeHashes] = useState([]);
  const [contract, setContract] = useState();

  let web3 = window.web3;

  useEffect(() => {
    const init = async () => {
      const networkId = await web3.eth.net.getId()
      console.log('Metamask is connected to: ' + networkId)
      const networkData = MemesHandler.networks[networkId]
      console.log(networkData);
      if (networkData) {
        //fetching the contract
        const abi = MemesHandler.abi
        const address = networkData.address
        const contract = new web3.eth.Contract(abi, address)
        setContract(contract);
        console.log('smart contract retrieved')

        //fetching the number of memes stored on blockchain
        const memesCount = await contract.methods.getMemesCount().call()
        console.log('count of stored memes: ' + memesCount)

        //fetching information about every meme and display it
        // let ipfsHash = '';
        // let votes = 0;
        let hashes = await contract.methods.getMemesList().call()
        console.log(hashes);
        setMemeHashes(hashes);
      }
    }

    init();
  }, []);

  return (
    <Main>
      {
        memeHashes.map((hash, index) => <CustomMeme hash={hash} contract={contract} index={index} />)
      }
    </Main>
  )
}

export default Memes;