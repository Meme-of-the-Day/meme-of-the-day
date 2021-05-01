const MTDV4 = artifacts.require('MemeOfTheDayV4Pause');
const Treasury4 = artifacts.require('MOTDTreasuryV4Pause');
const SaleParams4 = artifacts.require('MOTDSaleParametersProviderV4Pause');
const MemeSale4 = artifacts.require('MemeSaleV4PauseReentrancy');
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades');
 
module.exports = async function (deployer) {
  await prepareUpgrade('0xF7F0B02f9786c7a19cd2Ea646DdA33E18fa4AAc8', MTDV4, { deployer });
  await prepareUpgrade('0xd2f9b150021DA815F3dC927Bb85A5ec937D2944C', Treasury4, { deployer });
  await prepareUpgrade('0x0aD759D71F696c8aE66eEAB92cb3a2822F8c3142', SaleParams4, { deployer });
  await prepareUpgrade('0xd329a5DD0F112Ade06a60468027C4b8614e00Cb4', MemeSale4, { deployer });
  
};