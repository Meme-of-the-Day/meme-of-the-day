import React from 'react';
import styled from 'styled-components';

import Memes from '../components/Memes';

const Main = styled.div`
  padding: 16px;
`;

const Message = styled.em`
`;

// const initialize = async () => {
//         const web3 = (window as any).web3;
//         //https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#getaccounts
//         // const accounts = await web3.eth.getAccounts()
//         // console.log('Using account in Metamask: ' + accounts)
//         // this.setState({ account: accounts[0] })
//         const networkId = await web3.eth.net.getId()
//         console.log('Metamask is connected to: ' + networkId)
//         const networkData = MemesHandler.networks[networkId]
//         if (networkData) {
//             //fetching the contract
//             const abi = MemesHandler.abi
//             const address = networkData.address
//             const contract = new web3.eth.Contract(abi, address)
//             // this.setState({ contract: contract })
//             // console.log('smart contract retrieved')
//             // console.log(contract)

//             //fetching the number of memes stored on blockchain
//             const memesCount = await contract.methods.getMemesCount().call()
//             console.log('count of stored memes: ' + memesCount)

//             //fetching information about every meme and display it
//             let ipfsHash = '';
//             let votes = 0;
//             let owners =''
//             owners = await contract.methods.getMemesList().call()
//             // console.log('memes addreses retrieved:' + owners)
//             for (let i = 0; i < memesCount; i++) {
//                 ipfsHash = await contract.methods.getMemeByIndex(i).call()
//                 console.log('ipfsHash of ' + i + ' meme: ' + ipfsHash)
//                 console.log('owner of ' + i + ' meme:' + owners[i])
//                 votes = await contract.methods.getVotes(owners[i]).call()
//                 console.log('votes ' + i + ' meme has: ' + Number(votes))
//                 this.setState(state => {
//                     const stored = state.stored.concat(ipfsHash);
//                     return {
//                         stored,
//                     };
//                 });
//                 this.setState(state => {
//                     const memes = state.memes.concat({owner: owners[i], ipfsHash : ipfsHash, votes: Number(votes)});
//                     return {
//                         memes,
//                     };
//                 });
//                 console.log('Stored memes hashes: ' + this.state.stored)
//                 console.log('Stored memes object of ' + i + ': ' + this.state.memes[i].owner + '|' + this.state.memes[i].ipfsHash + '|' + this.state.memes[i].votes)
//             }

//         } else {
//             window.alert('Smart contract was not deployed to connected network!');
//         }
//     }

const Home: React.FC<{}> = () => {
  return <Main>
    <Message>Discover, vote, comment, upload, and own your favorite memes</Message>
    <Memes />
  </Main>;
}

export default Home;