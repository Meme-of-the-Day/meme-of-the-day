# Meme of the Day DApp -- Matic & IPFS

Meme of the Day is a fun social platform featuring memes stored as NFT collectibles, where users may uniquely share profits by voting on their favorite memes. They may also discover, upload, comment, favorite, share, buy, and sell memes in different categories.

<img src="/src/content/Meme-of-the-Day-dApp-Meme-Final.png" width=25% height=25% align="right">Meme of the Day was created for use with Matic Network and IPFS for minting and saving meme images as non-fungible tokens (NFTs). The dApp interface runs in a web browser, where the user uploads a meme image that runs through a smart contract to mint an NFT on Matic Network. The meme image is then saved in IPFS via Textile Hub, and the user sees the associated hash and the Matic transaction details. The "View Your Memes" page then displays the uploaded image. It is possible to get the dApp up and running in a local development environment with local Ethereum blockchain (Ganache) or with Matic Mumbai testnet.

Beyond this, our vision is for people to upvote, comment, favorite, share, buy, and sell memes they like, which would be featured in categorized ranking lists updated in real-time. Users will have the unique opportunity to share in the profits of memes sold that they upvoted. By paying a small amount for votes, they are incentivized to participate in Meme of the Day for fun and for profit. This dApp can also prove that a user is either the true creator or the first to claim title to a particular meme that they upload.

We are hopeful that Meme of the Day and the voting mechanism would offer a unique, gamified social experience for users and encourage more interest in Matic, IPFS, and Web3 technology.

**Dependencies are:**

- Node.js at least version 10.1x.x
  > Download from https://nodejs.org and follow installation instructions
- Truffle
- Matic Network
- IPFS
- Textile
- Fleek
  > Currently it is possible to use local blockchain (Ganache) or Matic testnet Ethereum L2 solution to run the dApp.<br>
  > Currently it is possible to use Metamask for testing the dApp.<br><br>

## Installation procedure for local blockchain (ex: ganache-cli)

```shell
git clone https://github.com/Meme-of-the-Day/meme-of-the-day-ipfs
cd meme-of-the-day-ipfs
source .env (// Insert the values in the file)
npm install
npm run deploydev (Spins up ganache-cli and deploys contract(s) on the chain)
npm run start (In another terminal)
```

You should see web browser open up, and the dApp will load and show the latest meme uploaded in browser window.

## Installation procedure (Matic Mumbai testnet)

Please follow additional instructions how to setup your Metamask to use Matic Mumbai testnet:<br>
https://docs.matic.network/docs/develop/metamask/config-matic<br>
Here is Matic Mumbai testnet Faucet to get some test Matic coins:<br>
https://faucet.matic.network/<br>
Here is additional information on how to deploy smart contract and dApp on Matic Mumbai testnet. You will need to create .secret file holding seed words from your wallet on Matic testnet Mumbai network:
https://docs.matic.network/docs/develop/truffle<br>

```shell
git clone https://github.com/Meme-of-the-Day/meme-of-the-day-ipfs
cd meme-of-the-day-ipfs
npm install
npm run migratematic
npm run start
```

The truffle migrate command would require the secret file to be updated with the mnemonic which is the secret to the account used to deploy contract on Matic chain.
When you start dApp with last command "npm run start", dApp will load and show the latest meme uploaded in browser window.
<br>

**Command to migrate smart contract to blockchain**

```shell
npm run migrate
```

After successful migration of smart contract to blockchain, you can interact with it using Truffle console.
<br><br>

**Some commands that you can use with Truffle console after smart contract is deployed**
After smart contract deployment to blockchain with migration, you can use Truffle console to interact with smart contracts using CLI. To start Truffle console from command shell type:

```shell
truffle console
```

After Truffle console is running you can get contract from blockchain with command:

```javascript
truffle(development)> const memeshandler = await MemesHandler.deployed()
```

You can store hash of meme to blockchain using contracts set function:

```javascript
truffle(development) > result = memeshandler.newMeme(
  "QmYHaaWHgpT2iBGNxMCCFpDKgskej6bhubd5cnytUuJKRp"
);
```

To get the account under which meme was stored on blockchain, you can type:

```javascript
truffle(development)> const memesList = memeshandler.getMemesList()
```

You need to type constant as command to get value stored in it:

```javascript
truffle(development) > memesList["0x787eBC47F34081a0Df4dc3923798828ae52C538C"];
```

Read the IPFS file hash from meme stored on blockchain:

```javascript
const meme = memeshandler.getMemeByAddress(
  "0x787eBC47F34081a0Df4dc3923798828ae52C538C"
);
```

Output IPFS file hash into console:

```javascript
meme;
("QmYHaaWHgpT2iBGNxMCCFpDKgskej6bhubd5cnytUuJKRp");
```

<br>

**To run tests defined in folder /src/contracts/test run from shell command**

Before running any command you have to create a `.env` file in the root of the project and inside it write whatever mnemonic
for a wallet you prefer, as specified in the `.env.example` file.

Once you're done, open another terminal in the root of the project and run

```bash
npm run ganache
```

this will start a `ganache-cli` process with the given mnemonic.

Finally, you can test the contracts using this command

```bash
npm run test-contracts
```

Tests will check if contract deployment on blockchain was done correctly, and it will check if get and set methods of smart contract are working correctly. After running the command, you will see output similar to:

```shell
Using network 'development'.

Compiling ./src/contracts/FilesHandler.sol...


  Contract: FilesHandler
    deployment
0xDA228234a792cb9C7C8cf9E9E0dB48A8F57C7D08
      ✓ deployed successfully!
    storage access
Saving and retrieveing from Blockhain
test123
      ✓ Hash saved and retrieved (282ms)


  2 passing (422ms)

```
