import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import MemesHandler from '../abis/MemeOfTheDay.json';
import Meme from './Meme';

const Main = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

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

const Memes: React.FC<{}> = () => {
  const [memeHashes, setMemeHashes] = useState<Array<string>>([]);
  const [contract, setContract] = useState();

  let web3 = window.web3;

  useEffect(() => {
    const init = async () => {
      const networkId = await web3.eth.net.getId()
      console.log('Metamask is connected to: ' + networkId)
      const networkData = MemesHandler.networks[networkId]

      if (networkData) {
        //fetching the contract
        const abi = MemesHandler.abi
        const address = networkData.address
        const contract = new web3.eth.Contract(abi, address)
        setContract(contract);
        console.log('smart contract retrieved')
        console.log(contract)

        //fetching the number of memes stored on blockchain
        const memesCount = await contract.methods.totalSupply().call()
        console.log('count of stored memes: ' + memesCount)

        //fetching hash from every meme and display it
        let hash = "test"
        let hashes = []


        for (var i = 1; i <= memesCount; i++) {
          hash = await contract.methods.hashes(i - 1).call()
          hashes.push(hash)
        }
        setMemeHashes(hashes);
      }
    }

    init();
  }, []);

  return (
    <Main>
      {
        memeHashes && memeHashes.map((hash, index) => <CustomMeme hash={hash} contract={contract} index={index} />)
      }
    </Main>
  )
}

export default Memes;
