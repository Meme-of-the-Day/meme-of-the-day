const MTDV3 = artifacts.require("MemeOfTheDayV3Pause");
const TreasuryV3 = artifacts.require("MOTDTreasuryV3Pause");
const SaleParamsV3 = artifacts.require("MOTDSaleParametersProviderV3Pause");

const MemeSaleV3 = artifacts.require("MemeSaleV3PauseReentrancy");

const VERSION_FOR_EIP712 = "1";

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, network, accounts) {
  //MemeOfTheDay.sol proxy deployment
  let motdProxy = await deployProxy(MTDV3, { deployer, initializer: 'initialize'});
  console.log("MemeOfTheDay Proxy Address: " + motdProxy.address);

  //MOTDTreasury.sol proxy deployment
  let treasuryProxy = await deployProxy(TreasuryV3, { deployer, initializer: 'initialize'});
  console.log("Treasury Proxy Address: " + await treasuryProxy.address);

  //MOTDSaleParametersProvider.sol proxy deployment
  let paramsProxy = await deployProxy(SaleParamsV3, { deployer, initializer: 'initialize'});
  console.log("Params Proxy Address: " + await paramsProxy.address);


  //MemeSale.sol proxy deployment
  let saleProxy = await deployProxy(MemeSaleV3, [motdProxy.address, treasuryProxy.address, paramsProxy.address, VERSION_FOR_EIP712], { deployer, initializer: 'initialize'});
  console.log("Sale Proxy Address: " + await saleProxy.address);
};
