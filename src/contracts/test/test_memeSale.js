var assert = require("assert");
const { ethers } = require("ethers");

const Web3 = require("web3");
const { getSellerSignedMessage } = require("./utils/sellerMessage");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MemeOfTheDay = artifacts.require("MemeOfTheDay.sol");
const MOTDTreasury = artifacts.require("MOTDTreasury.sol");
const MOTDSaleParamsProvider = artifacts.require(
  "MOTDSaleParametersProvider.sol"
);
const MemeSale = artifacts.require("MemeSale.sol");

contract("MemeSale", ([owner, ...accounts]) => {
  let tokenId;
  let seller;
  let buyer;

  beforeEach(async () => {
    const version = "1";

    this.motd = await MemeOfTheDay.new();
    this.motdTreasury = await MOTDTreasury.new();
    this.motdSaleParamsProvider = await MOTDSaleParamsProvider.new();

    this.memeSale = await MemeSale.new(
      this.motd.address,
      this.motdTreasury.address,
      this.motdSaleParamsProvider.address,
      version
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
  });

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
    } catch (err) {}
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
    } catch (err) {}
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

  it("doesn't sell a token if signer of message is wrong", async () => {
    await this.memeSale.putOnSale(tokenId, {
      from: seller,
    });

    await this.motd.setApprovalForAll(this.memeSale.address, true, {
      from: seller,
    });

    const mnemonic = process.env.MNEMONIC;
    const sellerWalletMnemonic = ethers.Wallet.fromMnemonic(
      mnemonic,
      "m/44'/60'/0'/0/2"
    );

    // Wallet connected to a provider
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:8545"
    );
    let sellerWallet = sellerWalletMnemonic.connect(provider);

    const price = web3.utils.toWei("1", "ether");
    const { signature, v, r, s } = await getSellerSignedMessage(
      tokenId,
      price,
      sellerWallet,
      this.memeSale.address
    );

    try {
      await this.memeSale.buy(tokenId, price, [], [], false, v, r, s, {
        from: buyer,
        value: price,
      });
    } catch (err) {
      assert.strictEqual(
        err.toString().includes("MemeSale: invalid signature."),
        true
      );
    }
  });
});
