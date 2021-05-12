//This file is another template for upgrading through the console.
//It is kept here for sake of backup and documentation

const MTDV4 = artifacts.require("MemeOfTheDayV4Pause");
const TreasuryV4 = artifacts.require("MOTDTreasuryV4Pause");
const SaleParamsV4 = artifacts.require("MOTDSaleParametersProviderV4Pause");

const MemeSaleV4 = artifacts.require("MemeSaleV4PauseReentrancy");

const VERSION_FOR_EIP712 = "4";

const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, accounts) {

  let motdProxy = await upgradeProxy('0x1F734Da0C3A561505d3eC59a94F10057DC52d272', MTDV4, 
  { deployer, initializer: 'initialize'});
  console.log("MemeOfTheDayV4 Proxy Address: " + motdProxy.address);


  let treasuryProxy = await upgradeProxy('0xC4273734022948aedDA9dc981a6c701ab3Ef592d', TreasuryV4, 
  { deployer, initializer: 'initialize'});
  console.log("TreasuryV4 Proxy Address: " + await treasuryProxy.address);

  let paramsProxy = await upgradeProxy('0xbB1d50b4f7078Cd282190a2201b618971cB4C75E', SaleParamsV4, 
  { deployer, initializer: 'initialize'});
  console.log("ParamsV4 Proxy Address: " + await paramsProxy.address);

  let saleProxy = await upgradeProxy('0xcd7f3a2c041caeDe12834A785B8265a6Ae5BDE21', MemeSaleV4, 
  [motdProxy.address, treasuryProxy.address, paramsProxy.address, VERSION_FOR_EIP712], 
  { deployer, initializer: 'initialize'});
  console.log("SaleV4 Proxy Address: " + await saleProxy.address);
};
