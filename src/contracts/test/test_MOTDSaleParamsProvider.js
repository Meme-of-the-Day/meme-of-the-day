var assert = require("assert");

const Web3 = require("web3");
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MOTDSaleParametersProvider = artifacts.require(
  "MOTDSaleParametersProvider.sol"
);

contract("MOTDSaleParametersProvider", ([owner, ...accounts]) => {
  const DEFAULT_CREATOR_FEE_PERCENT_INDEX = 0;
  const VOTERS_FEE_PERCENT_INDEX = 1;
  const PLATFORM_FEE_PERCENT_INDEX = 2;
  const TOTAL_FEES_PERCENT_INDEX = 3;
  const DEFAULT_CREATOR_FEE_PERCENT = 100;
  const VOTERS_FEE_PERCENT = 5;
  const PLATFORM_FEE_PERCENT = 19;

  beforeEach(async () => {
    this.paramsProvider = await MOTDSaleParametersProvider.new();
  });

  it("creates the variables with defaults", async () => {
    let [
      defaultCreatorFeePercent,
      votersFeePercent,
      platformFeePercent,
      totalFeesPercent,
    ] = await Promise.all([
      this.paramsProvider.parameters(DEFAULT_CREATOR_FEE_PERCENT_INDEX),
      await this.paramsProvider.parameters(VOTERS_FEE_PERCENT_INDEX),
      await this.paramsProvider.parameters(PLATFORM_FEE_PERCENT_INDEX),
      await this.paramsProvider.parameters(TOTAL_FEES_PERCENT_INDEX),
    ]);

    defaultCreatorFeePercent = web3.utils
      .BN(defaultCreatorFeePercent)
      .toNumber();
    votersFeePercent = web3.utils.BN(votersFeePercent).toNumber();
    platformFeePercent = web3.utils.BN(platformFeePercent).toNumber();
    totalFeesPercent = web3.utils.BN(totalFeesPercent).toNumber();

    assert.strictEqual(defaultCreatorFeePercent, DEFAULT_CREATOR_FEE_PERCENT);
    assert.strictEqual(votersFeePercent, VOTERS_FEE_PERCENT);
    assert.strictEqual(platformFeePercent, PLATFORM_FEE_PERCENT);
    assert.strictEqual(totalFeesPercent, votersFeePercent + platformFeePercent);
  });

  it("changes a variable if owner", async () => {
    const newCreatorFeeVal = 200; // = 20%
    await this.paramsProvider.changeParameter(
      DEFAULT_CREATOR_FEE_PERCENT_INDEX,
      newCreatorFeeVal,
      {
        from: owner,
      }
    );

    let creatorFeePercent = await this.paramsProvider.parameters(
      DEFAULT_CREATOR_FEE_PERCENT_INDEX
    );
    creatorFeePercent = web3.utils.BN(creatorFeePercent).toNumber();

    assert.strictEqual(newCreatorFeeVal, creatorFeePercent);
  });

  it("doesn't change a variable if caller is not owner", async () => {
    const newCreatorFeeVal = 200; // = 20%

    try {
      await this.paramsProvider.changeParameter(
        DEFAULT_CREATOR_FEE_PERCENT_INDEX,
        newCreatorFeeVal,
        {
          from: accounts[0],
        }
      );
    } catch (err) {}
  });
});
