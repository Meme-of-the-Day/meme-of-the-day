//This migration file will prepare the upgrade!
//It will deploy the new implementation contracts (the contracts the proxy will delegate calls to)
//It will check if storage layout of new implementation contracts are compatible and revert migration in case they are not.
//If successfull, go to OpenZeppelin Defender to complete the upgrade!
//IMPORTANT: COPY THE DEPLOYMENT PROTOCOLL FROM THE CONSOLE IN ORDER TO HAVE A RECORD OF THE NEW IMPLEMENTATION ADDRESSES

const MTDV4 = artifacts.require('MemeOfTheDayV4Pause');
const Treasury4 = artifacts.require('MOTDTreasuryV4Pause');
const SaleParams4 = artifacts.require('MOTDSaleParametersProviderV4Pause');
const MemeSale4 = artifacts.require('MemeSaleV4PauseReentrancy');
 
const { prepareUpgrade } = require('@openzeppelin/truffle-upgrades');
 
module.exports = async function (deployer) {
  //First argument is the PROXY ADDRESS of the respective contract!!
  //Second argument is the new implementation code!
  //You can further call any function that you want to be executed during migration, if you wish/need to do so... never remove deployer
  //Please consider wisely, if you run initializer again! As this could possibly overwrite data in the proxy contract, that you might wanted to keep
  //I recommend doing data changes (for example saleparameters) always after succesfull upgrade, on a higher level, manually,
  //through console command, or a possible admin web-interface

  await prepareUpgrade('0xF7F0B02f9786c7a19cd2Ea646DdA33E18fa4AAc8', MTDV4, { deployer });
  await prepareUpgrade('0xd2f9b150021DA815F3dC927Bb85A5ec937D2944C', Treasury4, { deployer });
  await prepareUpgrade('0x0aD759D71F696c8aE66eEAB92cb3a2822F8c3142', SaleParams4, { deployer });
  await prepareUpgrade('0xd329a5DD0F112Ade06a60468027C4b8614e00Cb4', MemeSale4, { deployer });
};