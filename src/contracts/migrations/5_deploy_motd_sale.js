const MemeOfTheDay = artifacts.require("MemeOfTheDay");
const MOTDTreasury = artifacts.require("MOTDTreasury");

const MemeSale = artifacts.require("MemeSale");
const MOTDSaleParametersProvider = artifacts.require(
  "MOTDSaleParametersProvider"
);

const VERSION_FOR_EIP712 = "1";

module.exports = async function (deployer) {
  const motdErc1155 = await MemeOfTheDay.deployed();
  const motdTreasury = await MOTDTreasury.deployed();
  const motdSaleParametersProvider = await MOTDSaleParametersProvider.deployed();

  await deployer.deploy(
    MemeSale,
    motdErc1155.address,
    motdTreasury.address,
    motdSaleParametersProvider.address,
    VERSION_FOR_EIP712
  );
};
