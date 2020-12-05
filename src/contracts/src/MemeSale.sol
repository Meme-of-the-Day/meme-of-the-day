// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";

import {EIP712Domain} from "./EIP712Domain.sol";
import {EIP712} from "./EIP712.sol";

import "./MemeOfTheDay.sol";
import "./MOTDTreasury.sol";
import "./MOTDSaleParametersProvider.sol";

/**
 * @title MemeSale
 * @notice contract that handles sales of memes
 * @author MemeOfTheDay
 */
contract MemeSale is EIP712Domain {
    using SafeMath for uint256;

    string internal constant VERIFYING_CONTRACT_NAME = "MemeSale";

    // keccak256(VerifyPrice(uint256 tokenId,uint256 price)")
    bytes32
        public constant VERIFY_PRICE_TYPEHASH = 0x01b2ca8b9a0a07d70c188f51d5d3ea9d76d3a4722a62ba8b3b3f9bbe316ca844;

    string
        internal constant _INVALID_SIGNATURE_ERROR = "MemeSale: invalid signature";

    MemeOfTheDay public memeOfTheDay;
    MOTDTreasury public memeOfTheDayTreasury;
    MOTDSaleParametersProvider memeOfTheDaySaleParametersProvider;

    mapping(uint256 => bool) public isOnSale;

    constructor(
        address memeOfTheDayAddress,
        address payable motdTreasuryAddress,
        address memeOfTheDaySaleParametersProviderAddress,
        string memory version
    ) public {
        memeOfTheDay = MemeOfTheDay(memeOfTheDayAddress);
        memeOfTheDayTreasury = MOTDTreasury(motdTreasuryAddress);
        memeOfTheDaySaleParametersProvider = MOTDSaleParametersProvider(
            memeOfTheDaySaleParametersProviderAddress
        );

        DOMAIN_SEPARATOR = EIP712.makeDomainSeparator(
            VERIFYING_CONTRACT_NAME,
            version
        );
    }

    /**
     * @notice Puts on sale a token
     * @param tokenId the id of the token to put to sale
     */
    function putOnSale(uint256 tokenId) external {
        require(
            memeOfTheDay.ownerOf(tokenId) == msg.sender,
            "Only owner of token can put on sale"
        );
        require(!isOnSale[tokenId], "Token is already on sale!");

        isOnSale[tokenId] = true;
    }

    /**
     * @notice Removes from sale a token
     * @param tokenId the id of the token to remove from sale
     */
    function removeFromSale(uint256 tokenId) external {
        require(
            memeOfTheDay.ownerOf(tokenId) == msg.sender,
            "Only owner of token can remove the token from sale"
        );
        require(isOnSale[tokenId], "Token is not on sale already!");

        isOnSale[tokenId] = false;
    }

    /**
     * @notice Buys token
     * @param tokenId       the id of the token to buy
     * @param price         the price of the token on sale
     * @param voters        array of voters on the meme
     * @param votes         array of votes of the voters
     * @param payCreator    defines if creator has to be paid or not
     * @param v             v part of the seller's signature
     * @param r             r part of the seller's signature
     * @param s             s part of the seller's signature
     */
    function buy(
        uint256 tokenId,
        uint256 price,
        address payable[] calldata voters,
        uint256[] calldata votes,
        bool payCreator,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        require(isOnSale[tokenId], "Given token is not on sale");
        require(msg.value == price, "Sent value should be equal to set price");

        bytes memory data = abi.encode(VERIFY_PRICE_TYPEHASH, tokenId, price);

        require(
            EIP712.recover(DOMAIN_SEPARATOR, v, r, s, data) ==
                memeOfTheDay.ownerOf(tokenId),
            _INVALID_SIGNATURE_ERROR
        );

        _buy(tokenId, price, voters, votes, payCreator);
    }

    function _buy(
        uint256 tokenId,
        uint256 price,
        address payable[] calldata voters,
        uint256[] calldata votes,
        bool payCreator
    ) internal {
        (
            uint256 votersFee,
            uint256 creatorFee,
            uint256 platformFee,
            uint256 ownerFee
        ) = _getFeesAmounts(price, tokenId, payCreator);

        uint256 totVotes = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            totVotes += votes[i];
        }

        for (uint256 i = 0; i < voters.length; i++) {
            uint256 voterFee = votersFee.mul(votes[i].div(totVotes));
            voters[i].transfer(voterFee);
        }

        if (payCreator) {
            memeOfTheDay.creatorOf(tokenId).transfer(creatorFee);
        }

        address(memeOfTheDayTreasury).transfer(platformFee);
        memeOfTheDay.ownerOf(tokenId).transfer(ownerFee);

        memeOfTheDay.safeTransferFrom(
            memeOfTheDay.ownerOf(tokenId),
            msg.sender,
            tokenId,
            1,
            ""
        );

        isOnSale[tokenId] = false;
    }

    function _getVotersFee(uint256 tokenPrice) internal view returns (uint256) {
        return
            tokenPrice.div(1000).mul(
                memeOfTheDaySaleParametersProvider.parameters(
                    memeOfTheDaySaleParametersProvider
                        .VOTERS_FEE_PERCENT_INDEX()
                )
            );
    }

    function _getCreatorFee(
        uint256 tokenPrice,
        uint256 tokenId,
        bool payCreator
    ) internal view returns (uint256) {
        uint256 creatorFee = 0;
        if (payCreator) {
            if (memeOfTheDay.creatorFee(tokenId) > -1) {
                creatorFee = tokenPrice.div(1000).mul(
                    uint256(memeOfTheDay.creatorFee(tokenId))
                );
            } else {
                creatorFee = tokenPrice.div(1000).mul(
                    memeOfTheDaySaleParametersProvider.parameters(
                        memeOfTheDaySaleParametersProvider
                            .DEFAULT_CREATOR_FEE_PERCENT_INDEX()
                    )
                );
            }
        }

        return creatorFee;
    }

    function _getPlatformFee(uint256 tokenPrice)
        internal
        view
        returns (uint256)
    {
        return
            tokenPrice.div(1000).mul(
                memeOfTheDaySaleParametersProvider.parameters(
                    memeOfTheDaySaleParametersProvider
                        .PLATFORM_FEE_PERCENT_INDEX()
                )
            );
    }

    function _getOwnerFee(
        uint256 tokenPrice,
        uint256 votersFee,
        uint256 creatorFee,
        uint256 platformFee
    ) internal pure returns (uint256) {
        return tokenPrice.sub(votersFee).sub(creatorFee).sub(platformFee);
    }

    function _getFeesAmounts(
        uint256 tokenPrice,
        uint256 tokenId,
        bool payCreator
    )
        internal
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        uint256 votersFee = _getVotersFee(tokenPrice);
        uint256 creatorFee = _getCreatorFee(tokenPrice, tokenId, payCreator);
        uint256 platformFee = _getPlatformFee(tokenPrice);
        uint256 ownerFee = _getOwnerFee(
            tokenPrice,
            votersFee,
            creatorFee,
            platformFee
        );

        return (votersFee, creatorFee, platformFee, ownerFee);
    }
}
