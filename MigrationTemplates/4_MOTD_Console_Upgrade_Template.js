//This file is an example of a complete upgrade through the console, NOT USING DEFENDER!
// I added this for sake of completeness. So, it is of course possible to run a complete upgrade without Defender
// But, I do recommend using defender for convenience

const MTDV2 = artifacts.require("MemeOfTheDayV2");
const TreasuryV2 = artifacts.require("MOTDTreasuryV2");
const SaleParamsV2 = artifacts.require("MOTDSaleParametersProviderV2");

const MemeSaleV2 = artifacts.require("MemeSaleV2");

const VERSION_FOR_EIP712 = "2";

const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, accounts) {
  //MemeOfTheDayV2.sol proxy deployment
  let motdProxy = await upgradeProxy('0x244E7eEaDa14C368451aeC567563C637e98095B6', MTDV2, { deployer, initializer: 'initialize'});
  console.log("MemeOfTheDayV2 Proxy Address: " + motdProxy.address);

  //MOTDTreasuryV2.sol proxy deployment
  let treasuryProxy = await upgradeProxy('0xD3A9CFE764E03b5Bec62CD2acEe8343f8ad17fc2', TreasuryV2, { deployer, initializer: 'initialize'});
  console.log("TreasuryV2 Proxy Address: " + await treasuryProxy.address);

  //MOTDSaleParametersProviderV2.sol proxy deployment
  let paramsProxy = await upgradeProxy('0x22d90Af53A8e852C2a3b3e15626851e341F8880A', SaleParamsV2, { deployer, initializer: 'initialize'});
  console.log("ParamsV2 Proxy Address: " + await paramsProxy.address);


  //MemeSaleV2.sol proxy deployment
  let saleProxy = await upgradeProxy('0xf194E6108f331f9E56014eEfd67dAC42627484f9', MemeSaleV2, [motdProxy.address, treasuryProxy.address, paramsProxy.address, VERSION_FOR_EIP712], { deployer, initializer: 'initialize'});
  console.log("SaleV2 Proxy Address: " + await saleProxy.address);
};
