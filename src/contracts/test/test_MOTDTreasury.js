var assert = require("assert");

const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MOTDTreasury = artifacts.require("MOTDTreasury.sol");

contract("MOTDTreasury", ([owner, ...accounts]) => {
  beforeEach(async () => {
    this.walletCreator = accounts[0];
    this.wallet = await MOTDTreasury.new();

    await web3.eth.sendTransaction({
      from: accounts[1],
      to: this.wallet.address,
      value: web3.utils.toWei("1", "ether"),
    });
  });

  it("stores eth", async () => {
    const walletBalance = await web3.eth.getBalance(this.wallet.address);
    assert.strictEqual(
      walletBalance.toString(),
      web3.utils.toWei("1", "ether")
    );
  });

  it("doesn't withdraw correctly if it's not owner to withdraw", async () => {
    try {
      await this.wallet.withdraw(web3.utils.toWei("1", "ether"), {
        from: accounts[1],
      });
    } catch (err) {}
  });

  it("withdraws correctly if it's owner to withdraw", async () => {
    await this.wallet.withdraw(web3.utils.toWei("1", "ether"), {
      from: owner,
    });

    const walletBalance = await web3.eth.getBalance(this.wallet.address);

    assert.strictEqual(walletBalance.toString(), "0");
  });

  it("doesn't withdraw if requested amount is higher than currently deposited value", async () => {
    try {
      await this.wallet.withdraw(web3.utils.toWei("2", "ether"), {
        from: owner,
      });
    } catch (err) {}
  });
});
