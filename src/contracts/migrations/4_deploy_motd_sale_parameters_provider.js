const MOTDSaleParametersProvider = artifacts.require(
  "MOTDSaleParametersProvider"
);

module.exports = function (deployer) {
  deployer.deploy(MOTDSaleParametersProvider);
};
