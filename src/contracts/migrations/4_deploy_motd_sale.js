const MemeOfTheDay = artifacts.require("MemeOfTheDay");
const MOTDTreasury = artifacts.require("MOTDTreasury");

const MemeSale = artifacts.require("MemeSale");

const VERSION_FOR_EIP712 = "1";

module.exports = async function (deployer) {
  const motdErc1155 = await MemeOfTheDay.deployed();
  const motdTreasury = await MOTDTreasury.deployed();

  await deployer.deploy(
    MemeSale,
    motdErc1155.address,
    motdTreasury.address,
    VERSION_FOR_EIP712
  );
};
