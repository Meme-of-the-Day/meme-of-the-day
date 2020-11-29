// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import {EIP712Domain} from "./EIP712Domain.sol";
import {EIP712} from "./EIP712.sol";

import "./MemeOfTheDay.sol";
import "./MOTDTreasury.sol";

contract MemeSale is EIP712Domain {
    string internal constant VERIFYING_CONTRACT_NAME = "MemeSale";

    // keccak256(VerifyPrice(uint256 tokenId,uint256 price)")
    bytes32
        public constant VERIFY_PRICE_TYPEHASH = 0x01b2ca8b9a0a07d70c188f51d5d3ea9d76d3a4722a62ba8b3b3f9bbe316ca844;

    string
        internal constant _INVALID_SIGNATURE_ERROR = "MemeSale: invalid signature";

    MemeOfTheDay public memeOfTheDay;
    MOTDTreasury public memeOfTheDayTreasury;

    constructor(
        address memeOfTheDayAddress,
        address payable motdTreasuryAddress,
        string memory version
    ) public {
        memeOfTheDay = MemeOfTheDay(memeOfTheDayAddress);
        memeOfTheDayTreasury = MOTDTreasury(motdTreasuryAddress);

        DOMAIN_SEPARATOR = EIP712.makeDomainSeparator(
            VERIFYING_CONTRACT_NAME,
            version
        );
    }

    function buy(
        uint256 tokenId,
        uint256 price,
        address payable[] calldata voters,
        bool payCreator,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        require(msg.value == price, "Sent value should be equal to set price");

        bytes memory data = abi.encode(VERIFY_PRICE_TYPEHASH, tokenId, price);

        require(
            EIP712.recover(DOMAIN_SEPARATOR, v, r, s, data) ==
                memeOfTheDay.ownerOf(tokenId),
            _INVALID_SIGNATURE_ERROR
        );

        for (uint256 i = 0; i < voters.length; i++) {
            voters[i].transfer(1);
        }

        if (payCreator) {
            memeOfTheDay.creatorOf(tokenId).transfer(10);
        }

        address(memeOfTheDayTreasury).transfer(100);

        memeOfTheDay.safeTransferFrom(
            memeOfTheDay.ownerOf(tokenId),
            msg.sender,
            tokenId,
            1,
            ""
        );
    }
}
