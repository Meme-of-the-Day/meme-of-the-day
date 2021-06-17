import web3Obj from './helper';

import { Torus } from "../utils/torus";
import { UserMetadata } from "../utils/torusTypes";

export var torusObject = {
    account: "",
    balance: '',
    selectedVerifier: 'google',
    placeholder: 'Enter google email',
    buildEnv: 'development',
    userInfo: '',
    provider: '',
    publicAddress: ''
}

export const enableTorus = async (buildEnv) => {
    try {
        await web3Obj.initialize(buildEnv)
        setStateInfo()
    } catch (error) {
        console.log(error);
    }
}

export const setStateInfo = () => {
    web3Obj.web3.eth.getAccounts().then(accounts => {
        torusObject.account = accounts[0]
        web3Obj.web3.eth.getBalance(accounts[0]).then(balance => {
            torusObject.balance = balance
            getUserInfo()
        })
    })
}

export const getUserInfo = async () => {
    const userInfo = await web3Obj.torus.getUserInfo()
    torusObject.userInfo = userInfo
    torusObject.selectedVerifier = userInfo.typeOfLogin
    changeProvider()
    getPublicAddress()

}

export const changeProvider = async () => {
    const provider = await web3Obj.torus.setProvider({ host: 'ropsten' })
    torusObject.provider = provider
}

export const createPaymentTx = () => {
    web3Obj.torus
        .initiateTopup('wyre', {
            selectedCurrency: 'USD',
            fiatValue: '250',
            selectedCryptoCurrency: 'ETH'
        })
        .catch(err => this.console(err.message))
}

export const sendEth = () => {
    const { account } = torusObject
    web3Obj.web3.eth.sendTransaction({ from: account, to: account, value: web3Obj.web3.utils.toWei('0.01') })
}

export const getPublicAddress = async () => {

    if (torusObject.selectedVerifier === "google") {
        const publicAddress = await web3Obj.torus.getPublicAddress({ verifier: torusObject.selectedVerifier, verifierId: torusObject.userInfo.email, isExtended: true })
        torusObject.publicAddress = publicAddress
    }

    localStorage.setItem('loginDetails', JSON.stringify(torusObject));



    const torusInstance = await Torus.getInstance();

    let userInfo = torusObject.userInfo;
    const userData = await torusInstance.getUserData(torusObject.account);
    if (userData.length == 0) {
        let usexrMatadata = {
            _id: torusObject.account,
            walletID: torusObject.account,
            cid: "Not Found",
            path: "Pass BuK PAth",
            publicAddress: torusObject.publicAddress,
            balance: torusObject.balance,
            date: "" + new Date(),
            userInfo: userInfo,
            email: userInfo.email,
        }
        const result = await torusInstance.createUserMetadata(usexrMatadata);
        console.log(result);
    } else {
        console.log("There Login")
    }
}


export const logout = () => {
    web3Obj.torus.cleanUp().then(() => {
        this.setState({ account: '', balance: 0 })
        sessionStorage.setItem('pageUsingTorus', false)
    })
}


