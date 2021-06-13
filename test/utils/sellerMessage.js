const { ethers } = require("ethers");
const sigUtil = require("eth-sig-util");
const EIP712 = require("./EIP712");

async function getSellerSignedMessage(
  tokenId,
  price,
  sellerWallet,
  verifyingContract
) {
  try {
    const sellerSetPriceTypedData = {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        VerifyPrice: [
          { name: "tokenId", type: "uint256" },
          { name: "price", type: "uint256" },
        ],
      },
      domain: {
        name: "MemeSale",
        version: "1",
        chainId: 3431,
        verifyingContract,
      },
      primaryType: "VerifyPrice",
      message: {
        tokenId,
        price,
      },
    };

    let { v, r, s } = await EIP712.sign(
      sellerSetPriceTypedData.domain,
      sellerSetPriceTypedData.primaryType,
      sellerSetPriceTypedData.message,
      sellerSetPriceTypedData.types,
      sellerWallet
    );

    let signature = await ethers.utils.joinSignature({ v, r, s });

    return { signature, v, r, s };
  } catch (err) {
    console.error(err);
  }
}

module.exports = { getSellerSignedMessage };
