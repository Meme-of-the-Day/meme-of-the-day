//This file is another Template for deploying the proxy setup for the first time
//It is kept here for sake of backup and documentation

const MTD = artifacts.require("MemeOfTheDay");
const Treasury = artifacts.require("MOTDTreasury");
const SaleParams = artifacts.require("MOTDSaleParametersProvider");

const MemeSale = artifacts.require("MemeSale");

const VERSION_FOR_EIP712 = "1";

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, network, accounts) {
  //MemeOfTheDay.sol proxy deployment
  let motdProxy = await deployProxy(MTD, { deployer, initializer: 'initialize'});
  console.log("MemeOfTheDay Proxy Address: " + motdProxy.address);

  //MOTDTreasury.sol proxy deployment
  let treasuryProxy = await deployProxy(Treasury, { deployer, initializer: 'initialize'});
  console.log("Treasury Proxy Address: " + await treasuryProxy.address);

  //MOTDSaleParametersProvider.sol proxy deployment
  let paramsProxy = await deployProxy(SaleParams, { deployer, initializer: 'initialize'});
  console.log("Params Proxy Address: " + await paramsProxy.address);

  //MemeSale.sol proxy deployment
  let saleProxy = await deployProxy(MemeSale, [motdProxy.address, treasuryProxy.address, paramsProxy.address, VERSION_FOR_EIP712], { deployer, initializer: 'initialize'});
  console.log("Sale Proxy Address: " + await saleProxy.address);
};
