import Web3Modal, { IProviderOptions } from 'web3modal';
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions: IProviderOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                137: "https://rpc-mainnet.matic.network",
                80001: "https://rpc-mumbai.matic.today"
            }
        }
    }
}

const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions
});

export default web3Modal;