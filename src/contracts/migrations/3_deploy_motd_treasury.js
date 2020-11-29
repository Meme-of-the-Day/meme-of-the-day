const MOTDTreasury = artifacts.require("MOTDTreasury");

module.exports = function (deployer) {
  deployer.deploy(MOTDTreasury);
};
