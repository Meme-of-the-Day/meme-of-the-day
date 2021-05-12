//This file is another template for the PrepareUpgrade process, which will be completed in DEFENDER after successfull preparation
//It is kept here for sake of backup and documentation

const MTDV4 = artifacts.require('MemeOfTheDayV4Pause');
const Treasury4 = artifacts.require('MOTDTreasuryV4Pause');
const SaleParams4 = artifacts.require('MOTDSaleParametersProviderV4Pause');
const MemeSale4 = artifacts.require('MemeSaleV4PauseReentrancy');
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades');
 
module.exports = async function (deployer) {
  await prepareUpgrade('0x3229F0860087Aa81BDfa8831394C334C6dd6000D', MTDV4, { deployer });
  await prepareUpgrade('0x984a6e84377F00AB6Dad9a34d739158E4Bd183D0', Treasury4, { deployer });
  await prepareUpgrade('0x9304FfC0d1568Cea8c9ef688C22322a32aEB6593', SaleParams4, { deployer });
  await prepareUpgrade('0x7066181dCa4887265717a8b1AAB302D64e76Ee36', MemeSale4, { deployer });
};