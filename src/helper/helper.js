import Web3 from 'web3'
import Torus from '@toruslabs/torus-embed'


const web3Obj = {
    web3: new Web3(),
    torus: new Torus(),
    setweb3: function (provider) {
        const web3Inst = new Web3(provider)
        web3Obj.web3 = web3Inst
    },
    initialize: async function (buildEnv) {
        const torus = new Torus()
        await torus.init({ buildEnv: buildEnv || 'production', network: { host: 'mumbai' } })
        await torus.login()
        web3Obj.setweb3(torus.provider)
        web3Obj.torus = torus
        sessionStorage.setItem('pageUsingTorus', buildEnv)
        localStorage.setItem('pageUsingTorus', buildEnv);
    }
}
export default web3Obj

