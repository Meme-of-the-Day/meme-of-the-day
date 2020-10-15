import React, { Component } from 'react';
import Web3 from 'web3';
import MemesHandler from '../abis/MemeOfTheDay.json';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';
import Badge from './Badge';
import { AnyARecord } from 'dns';
const ipfsClient = require('ipfs-http-client')
// connect to public ipfs daemon API server
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

declare let window: any;

type IMemeProps = {
    owner: string,
    ipfsHash: string,
    votes: Number
};

type IMemeState = {
    account: string,
    buffer: Buffer,
    contract?: any,
    memeHash: string,
    stored: Array<string>,
    memes: Array<IMemeProps>
};

export default class Content extends Component<{}, IMemeState> {
    readonly state: IMemeState = {
        account: '',
        buffer: Buffer.from(''),
        contract: null,
        memeHash: 'QmNP2xz4PkPXZwaUyzC9tyDdTjEpET1D3vW1CdwNQdyTdM',
        stored: [],
        memes: []
    }

    async componentDidMount() {
        await this.loadWeb3()
        await this.initialize()
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('To work correctly, please use metamask!')
        }
    }

    async initialize()
    {
        const web3 = window.web3
        //https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#getaccounts
        const accounts = await web3.eth.getAccounts()
        console.log('Using account in Metamask: ' + accounts)
        this.setState({ account: accounts[0] })
        const networkId = await web3.eth.net.getId()
        console.log('Metamask is connected to: ' + networkId)
        const networkData = MemesHandler.networks[networkId]
        if (networkData) {
            //fetching the contract
            const abi = MemesHandler.abi
            const address = networkData.address
            const contract = new web3.eth.Contract(abi, address)
            this.setState({ contract: contract })
            console.log('smart contract retrieved')
            console.log(contract)
            //fetching the number of memes stored on blockchain
            const memesCount = await contract.methods.getMemesCount().call()
            console.log('count of stored memes: ' + memesCount)
            //fetching information about every meme and display it
            let ipfsHash = '';
            let votes = 0;
            let owners =''
            owners = await contract.methods.getMemesList().call()
            console.log('memes addreses retrieved:' + owners)
            for (let i = 0; i < memesCount; i++) {
                ipfsHash = await contract.methods.getMemeByIndex(i).call()
                console.log('ipfsHash of ' + i + ' meme: ' + ipfsHash)
                console.log('owner of ' + i + ' meme:' + owners[i])
                votes = await contract.methods.getVotes(owners[i]).call()
                console.log('votes ' + i + ' meme has: ' + Number(votes))
                this.setState(state => {
                    const stored = state.stored.concat(ipfsHash);
                    return {
                        stored,
                    };
                });
                this.setState(state => {
                    const memes = state.memes.concat({owner: owners[i], ipfsHash : ipfsHash, votes: Number(votes)});
                    return {
                        memes,
                    };
                });
                console.log('Stored memes hashes: ' + this.state.stored)
                console.log('Stored memes object of ' + i + ': ' + this.state.memes[i].owner + '|' + this.state.memes[i].ipfsHash + '|' + this.state.memes[i].votes)
            }

        } else {
            window.alert('Smart contract was not deployed to connected network!');
        }
    }

    captureMeme = async (event: any) => {
        event.preventDefault()
        // file processing for store to IPFS
        const file = event.target.files[0]
        const buffer = await file.arrayBuffer();
        this.setState({ buffer: buffer })
        console.log('meme uploaded to browser cache...')
        console.log(this.state.buffer);

        ipfs.add(this.state.buffer, (error: any, result: any) => {
            if (error) {
                console.error(error)
                return
            }

            console.log('Ipfs result', result)
            const memeHash = result[0].hash
            this.setState({ memeHash })
        })
    }

    onSubmit = (event: any) => {
        event.preventDefault()
        console.log("Submitting the form...storing meme on blockchain")
        //storing meme with hash on blockchain
        console.log('Meme will be stored with account: ' + this.state.account);

        this.state.contract.methods.newMeme(this.state.memeHash).send({ from: this.state.account }).then((err: any, res: AnyARecord) => {
            console.log('inside of contract function call')
            //this.setState({ memeHash: memeHash })
        })
        //special code for writting to array of React's state object
        this.setState(state => {
            const stored = state.stored.concat(this.state.memeHash);

            return {
                stored,
            };
        });
        console.log('stored memes: ' + this.state.stored)
    }

    render() {
        let index=1;
        return (
            <div className="container-fluid">
                <div className="row">
                    <ImageUpload memeHash={this.state.memeHash} onSubmit={this.onSubmit} captureMeme={this.captureMeme} />
                    <div className="col-md-9" style={{ paddingTop: "3%" }}>
                        <Badge />
                        <div className="row imageGallery">
                            {this.state.memes.map((item)=><ImageGallery item={item} id={index++}/>)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
