import Ceramic from '@ceramicnetwork/ceramic-http-client';
import { IDXWeb } from '@ceramicstudio/idx-web';
import { definitions } from '@ceramicstudio/idx-constants'
// @ts-ignore no type definitions for 3ID Connect yet
import { EthereumAuthProvider } from '3id-connect';
import Web3Modal from 'web3modal'

const CERAMIC_URL = 'https://ceramic.3boxlabs.com' // 'http://localhost:7007'
const web3Modal = new Web3Modal({ network: 'mainnet', cacheProvider: true })

export type AuthProvider = {
    ethProvider: any,
    ceramic: Ceramic,
    idx: IDXWeb
}

export async function authenticate(): Promise<AuthProvider> {
    const ceramic = new Ceramic(CERAMIC_URL);
    const idx = new IDXWeb({ ceramic, definitions });
    const ethereumProvider = await web3Modal.connect();
    const { result } = await ethereumProvider.send('eth_requestAccounts');
    // Authenticate the IDX instance using the Ethereum provider via 3ID Connect
    await idx.authenticate({
        authProvider: new EthereumAuthProvider(ethereumProvider, result[0]),
    });

    return {
        ethProvider: ethereumProvider,
        ceramic: ceramic,
        idx: idx
    };
}
