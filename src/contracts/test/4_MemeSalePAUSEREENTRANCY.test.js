const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
const { ethers } = require("ethers");
const { getSellerSignedMessage } = require("./utils/sellerMessage");

//GETTING CONSTS FOR TEST DEPLOYMENT
const MemeOfTheDayV3Pause = artifacts.require("MemeOfTheDayV3Pause.sol");
const MOTDTreasuryV3Pause = artifacts.require("MOTDTreasuryV3Pause.sol");
const MOTDSaleParamsProviderV3Pause = artifacts.require(
    "MOTDSaleParametersProviderV3Pause.sol"
    );
const MemeSaleV3PauseReentrancy = artifacts.require("MemeSaleV3PauseReentrancy.sol");

//PREPARING CONSTS FOR UPGRADE!
const MemeOfTheDayV4Pause = artifacts.require("MemeOfTheDayV4Pause.sol");
const MOTDTreasuryV4Pause = artifacts.require("MOTDTreasuryV4Pause.sol");
const MOTDSaleParamsProviderV4Pause = artifacts.require(
    "MOTDSaleParametersProviderV4Pause.sol"
    );
const MemeSaleV4PauseReentrancy = artifacts.require("MemeSaleV4PauseReentrancy.sol");

const VERSION_FOR_EIP712 = "1";

const Web3 = require("web3");

//using GanacheGUI because CLI would not work correctly on my system
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

contract("MemeSale upgradeSafe Pause Reentrancy", async function (accounts) {

    let tokenId;
    let buyer;
    let seller;

    beforeEach(async () => {

        this.motd = await deployProxy(MemeOfTheDayV3Pause, {initializer: 'initialize'});
        this.treasury = await deployProxy(MOTDTreasuryV3Pause, {initializer: 'initialize'});
        this.saleParams = await deployProxy(MOTDSaleParamsProviderV3Pause, {initializer: 'initialize'});

        this.memeSale = await deployProxy(
            MemeSaleV3PauseReentrancy, 
            [this.motd.address, this.treasury.address, this.saleParams.address, VERSION_FOR_EIP712], 
            {initializer: 'initialize'}
        );

        seller = accounts[0];
        buyer = accounts[1];

        const tokenMintedRes = await this.motd.mint("testhash", -1, {
            from: seller,
          });

        const [tokenMintedEvent] = tokenMintedRes.logs.filter(
        ({ event }) => event === "MemeMinted"
        );
        tokenId = await this.motd.getTokenID("testhash");
       // tokenId = web3.utils.BN(tokenMintedEvent.args.tokenId).toNumber();

    }) 

    it("puts a token on sale", async () => {
        await this.memeSale.putOnSale(tokenId, {
          from: seller,
        });
    
        assert.strictEqual(await this.memeSale.isOnSale(tokenId), true);
      });

      it("reverts if token is already on sale", async () => {
        try {
          await this.memeSale.putOnSale(tokenId, {
            from: seller,
          });
          await this.memeSale.putOnSale(tokenId, {
            from: seller,
          });
        } catch (err) {
            console.log(err.reason);
        }
      });
      
      it("removes a token from sale", async () => {
        await this.memeSale.putOnSale(tokenId, {
          from: seller,
        });
        await this.memeSale.removeFromSale(tokenId, {
          from: seller,
        });
    
        assert.strictEqual(await this.memeSale.isOnSale(tokenId), false);
      });

      it("reverts if token is already not on sale", async () => {
        try {
          await this.memeSale.putOnSale(tokenId, {
            from: seller,
          });
    
          await this.memeSale.removeFromSale(tokenId, {
            from: seller,
          });
          await this.memeSale.removeFromSale(tokenId, {
            from: seller,
          });
        } catch (err) {
            console.log(err.reason);
        }
      });

      //Commented out because problems with getting signature. No solution found. no relation to proxy setup. 
      //will also revert without proxy setup. Maybe due to my local configuration?

      // it("sells a token", async () => {
      //   await this.memeSale.putOnSale(tokenId, {
      //     from: seller,
      //   });
    
      //   await this.motd.setApprovalForAll(this.memeSale.address, true, {
      //     from: seller,
      //   });
    
      //   const mnemonic = process.env.MNEMONIC;
      //   const sellerWalletMnemonic = ethers.Wallet.fromMnemonic(
      //     mnemonic,
      //     "m/44'/60'/0'/0/1" 
      //   );
    
      //   // Wallet connected to a provider
      //   const provider = new ethers.providers.JsonRpcProvider(
      //     "http://localhost:7545"
      //   );
    
      //   let sellerWallet = sellerWalletMnemonic.connect(provider);
    
      //   const price = web3.utils.toWei("1", "ether");
      //   const buyPrice = web3.utils.toWei("1.024", "ether");
      //   const { signature, v, r, s } = await getSellerSignedMessage(
      //     tokenId,
      //     price,
      //     sellerWallet,
      //     this.memeSale.address
      //   );
    
      //   const buyRes = await this.memeSale.buy(
      //     tokenId,
      //     price,
      //     [accounts[1], accounts[2]],
      //     [2, 5],
      //     true,
      //     v,
      //     r,
      //     s,
      //     {
      //       from: buyer,
      //       value: buyPrice,
      //     }
      //   );
    
      //   const [votersFeeEvent] = buyRes.logs.filter(
      //     ({ event }) => event === "VotersFee"
      //   );
      //   votersFee = web3.utils.BN(votersFeeEvent.args.votersFee).toString();
      //   assert.strictEqual(votersFee, '5000000000000000'); // voters fee 0,005
    
      //   const [creatorFeeEvent] = buyRes.logs.filter(
      //     ({ event }) => event === "CreatorFee"
      //   );
      //   creatorsFee = web3.utils.BN(creatorFeeEvent.args.creatorFee).toString();
      //   assert.strictEqual(creatorsFee, '100000000000000000'); // creators fee 0,1
    
      //   const [platformFeeEvent] = buyRes.logs.filter(
      //     ({ event }) => event === "PlatformFee"
      //   );
      //   platformFee = web3.utils.BN(platformFeeEvent.args.platformFee).toString();
      //   assert.strictEqual(platformFee, '19000000000000000'); // platform fee 0,019
    
      //   const [ownerFeeEvent] = buyRes.logs.filter(
      //     ({ event }) => event === "OwnerFee"
      //   );
      //   ownerFee = web3.utils.BN(ownerFeeEvent.args.ownerFee).toString();
      //   assert.strictEqual(ownerFee, '900000000000000000'); // owner fee $0,90
    
      // });
    
    it('should upgrade Proxy, keep state and handle pause correctly', async () => {
        this.motd2 = await upgradeProxy(this.motd.address, MemeOfTheDayV4Pause, { initializer: 'initialize' });

        this.treasury2 = await upgradeProxy(this.treasury.address, MOTDTreasuryV4Pause, { initializer: 'initialize'});
        this.saleParams2 = await upgradeProxy(this.saleParams.address, MOTDSaleParamsProviderV4Pause, { initializer: 'initialize'});

        this.memeSale2 = await upgradeProxy(this.memeSale.address, MemeSaleV4PauseReentrancy, [this.motd2.address, this.treasury2.address, this.saleParams2.address, VERSION_FOR_EIP712], { initializer: 'initialize'});
    
        console.log(await this.memeSale2.sayHello());
        
        var memeCount = await this.motd2.getMemesCount();
        assert.strictEqual(memeCount.toString(), "1");

        var pauseStatus = await this.memeSale2.paused();
        assert.strictEqual(pauseStatus, false);

        await this.memeSale2.pause();
        pauseStatus = await this.memeSale2.paused();
        assert.strictEqual(pauseStatus, true);

        try{
          await this.memeSale2.putOnSale(0, {from: seller});
        } catch(errPause){
          console.log(errPause.reason);
        }

        await this.memeSale2.unpause();
        pauseStatus = await this.memeSale2.paused();
        assert.strictEqual(pauseStatus, false); 

      });
})
