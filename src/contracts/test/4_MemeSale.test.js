const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
const { ethers } = require("ethers");
const { getSellerSignedMessage } = require("./utils/sellerMessage");

const MemeOfTheDay = artifacts.require("MemeOfTheDay.sol");
const MOTDTreasury = artifacts.require("MOTDTreasury.sol");
const MOTDSaleParamsProvider = artifacts.require(
    "MOTDSaleParametersProvider.sol"
    );
const MemeSale = artifacts.require("MemeSale.sol");

const VERSION_FOR_EIP712 = "1";

const Web3 = require("web3");

let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));

contract("MemeSale upgradeSafe", async function (accounts) {

    let tokenId;
    let buyer;
    let seller;

    beforeEach(async () => {

        this.motd = await deployProxy(MemeOfTheDay, {initializer: 'initialize'});
        this.treasury = await deployProxy(MOTDTreasury, {initializer: 'initialize'});
        this.saleParams = await deployProxy(MOTDSaleParamsProvider, {initializer: 'initialize'});

        this.memeSale = await deployProxy(
            MemeSale, 
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

        tokenId = web3.utils.BN(tokenMintedEvent.args.tokenId).toNumber();

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


      it("sells a token", async () => {
        await this.memeSale.putOnSale(tokenId, {
          from: seller,
        });
    
        await this.motd.setApprovalForAll(this.memeSale.address, true, {
          from: seller,
        });
    
        const mnemonic = process.env.MNEMONIC;
        const sellerWalletMnemonic = ethers.Wallet.fromMnemonic(
          mnemonic,
          "m/44'/60'/0'/0/1"
        );
    
        // Wallet connected to a provider
        const provider = new ethers.providers.JsonRpcProvider(
          "http://localhost:8545"
        );
    
        let sellerWallet = sellerWalletMnemonic.connect(provider);
    
        const price = web3.utils.toWei("1", "ether");
        const buyPrice = web3.utils.toWei("1.024", "ether");
        const { signature, v, r, s } = await getSellerSignedMessage(
          tokenId,
          price,
          sellerWallet,
          this.memeSale.address
        );
    
        const buyRes = await this.memeSale.buy(
          tokenId,
          price,
          [accounts[1], accounts[2]],
          [2, 5],
          true,
          v,
          r,
          s,
          {
            from: buyer,
            value: buyPrice,
          }
        );
    
        const [votersFeeEvent] = buyRes.logs.filter(
          ({ event }) => event === "VotersFee"
        );
        votersFee = web3.utils.BN(votersFeeEvent.args.votersFee).toString();
        assert.strictEqual(votersFee, '5000000000000000'); // voters fee 0,005
    
        const [creatorFeeEvent] = buyRes.logs.filter(
          ({ event }) => event === "CreatorFee"
        );
        creatorsFee = web3.utils.BN(creatorFeeEvent.args.creatorFee).toString();
        assert.strictEqual(creatorsFee, '100000000000000000'); // creators fee 0,1
    
        const [platformFeeEvent] = buyRes.logs.filter(
          ({ event }) => event === "PlatformFee"
        );
        platformFee = web3.utils.BN(platformFeeEvent.args.platformFee).toString();
        assert.strictEqual(platformFee, '19000000000000000'); // platform fee 0,019
    
        const [ownerFeeEvent] = buyRes.logs.filter(
          ({ event }) => event === "OwnerFee"
        );
        ownerFee = web3.utils.BN(ownerFeeEvent.args.ownerFee).toString();
        assert.strictEqual(ownerFee, '900000000000000000'); // owner fee $0,90
    
      });
    
    
})
