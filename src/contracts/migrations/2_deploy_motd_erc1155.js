const MemeOfTheDay = artifacts.require("MemeOfTheDay");

module.exports = function (deployer) {
  deployer.deploy(MemeOfTheDay);
};
