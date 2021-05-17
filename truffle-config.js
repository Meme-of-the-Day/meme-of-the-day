require("babel-register");
require("babel-polyfill");
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = process.env.MNEMONIC;
var networkId = process.env.npm_package_config_ganache_networkId;
var gasPrice = process.env.npm_package_config_ganache_gasPrice;
var gasLimit = process.env.npm_package_config_ganache_gasLimit;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: networkId,
      gas: gasLimit,
      gasPrice: gasPrice,
    },
    matic: {
      provider: () =>
        new HDWalletProvider(mnemonic, `https://rpc-mumbai.matic.today`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  contracts_directory: "./src/contracts/src/",
  contracts_build_directory: "./src/contracts/abis/",
  migrations_directory: "./src/contracts/migrations/",
  compilers: {
    solc: {
      version: "0.6.12",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // Only to enable when wanting to test gas because otherwise it slows down the tests A LOT
  // mocha: {
  //   reporter: "eth-gas-reporter",
  // },
};
