var assert = require("assert");

const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MemeOfTheDay = artifacts.require("MemeOfTheDay.sol");

contract("MemeOfTheDay", ([owner, ...accounts]) => {
  before(async () => {
    this.motd = await MemeOfTheDay.new();
  });

  it("mints a token with given hash", async () => {
    const tokenMintedRes = await this.motd.mint("testhash", {
      from: accounts[0],
    });

    const [tokenMintedEvent] = tokenMintedRes.logs.filter(
      ({ event }) => event === "MemeMinted"
    );

    const tokenId = web3.utils.BN(tokenMintedEvent.args.tokenId).toNumber();

    assert.strictEqual(await this.motd.creatorOf(tokenId), accounts[0]);
    assert.strictEqual(await this.motd.ownerOf(tokenId), accounts[0]);
  });

  it("doesn't mint a token if given hash is already used", async () => {
    try {
      await this.motd.mint("testhash", {
        from: accounts[0],
      });
    } catch (err) {}
  });

  it("returns the number of tokens", async () => {
    let memesCount = await this.motd.getMemesCount({
      from: accounts[0],
    });

    memesCount = web3.utils.BN(memesCount).toNumber();

    assert.strictEqual(memesCount, 1);
  });
});
