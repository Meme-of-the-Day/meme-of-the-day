// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//Removed because sol 0.8.0 already checks for over and underflow
//import "@openzeppelin/contracts/math/SafeMath.sol";

import {EIP712Domain} from "./EIP712Domain.sol";
import {EIP712} from "./EIP712.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

//IN CASE OF UPGRADE THESE IMPORTS NEED TO BE UPDATED AS WELL ! ! !
import "./MemeOfTheDayV3Pause.sol";
import "./MOTDTreasuryV3Pause.sol";
import "./MOTDSaleParametersProviderV3Pause.sol";

/**
 * @title MemeSale
 * @notice contract that handles sales of memes
 * @author MemeOfTheDay
 */
contract MemeSaleV3PauseReentrancy is EIP712Domain, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable{

    //Removed because sol 0.8.0 natively checks for over and underflow
    //using SafeMath for uint256;

    string internal constant VERIFYING_CONTRACT_NAME = "MemeSale";

    // keccak256(VerifyPrice(uint256 tokenId,uint256 price)")
    bytes32
        public constant VERIFY_PRICE_TYPEHASH = 0x01b2ca8b9a0a07d70c188f51d5d3ea9d76d3a4722a62ba8b3b3f9bbe316ca844;

    string
        internal constant _INVALID_SIGNATURE_ERROR = "MemeSale: invalid signature";

    MemeOfTheDayV3Pause public memeOfTheDay;
    MOTDTreasuryV3Pause public memeOfTheDayTreasury;
    MOTDSaleParametersProviderV3Pause memeOfTheDaySaleParametersProvider;

    mapping(uint256 => bool) public isOnSale;

    event VotersFee(uint256 votersFee);
    event CreatorFee(uint256 creatorFee);
    event PlatformFee(uint256 platformFee);
    event OwnerFee(uint256 ownerFee);

    //Due to UPGRADEABILITY, Initializer is used! NO CONSTRUCTOR Can be used anymore!
    function initialize(
        address memeOfTheDayAddress,
        address payable motdTreasuryAddress,
        address memeOfTheDaySaleParametersProviderAddress,
        string memory version
        ) public initializer {

        __Ownable_init();
        __Pausable_init();

        memeOfTheDay = MemeOfTheDayV3Pause(memeOfTheDayAddress);

        memeOfTheDayTreasury = MOTDTreasuryV3Pause(motdTreasuryAddress);

        memeOfTheDaySaleParametersProvider = MOTDSaleParametersProviderV3Pause(memeOfTheDaySaleParametersProviderAddress);
        
        DOMAIN_SEPARATOR = EIP712.makeDomainSeparator(
            VERIFYING_CONTRACT_NAME,
            version
        );
    }
   

    //REPLACED BY INITIALIZER DUE TO UPGRADEABLE DESIGN
    // constructor(
    //     address memeOfTheDayAddress,
    //     address payable motdTreasuryAddress,
    //     address memeOfTheDaySaleParametersProviderAddress,
    //     string memory version
    // ) public {
    //     memeOfTheDay = MemeOfTheDay(memeOfTheDayAddress);
    //     memeOfTheDayTreasury = MOTDTreasury(motdTreasuryAddress);
    //     memeOfTheDaySaleParametersProvider = MOTDSaleParametersProvider(
    //         memeOfTheDaySaleParametersProviderAddress
    //     );

    //     DOMAIN_SEPARATOR = EIP712.makeDomainSeparator(
    //         VERIFYING_CONTRACT_NAME,
    //         version
    //     );
    // }

    /**
     * @notice Puts on sale a token
     * @param tokenId the id of the token to put to sale
     */
    function putOnSale(uint256 tokenId) external whenNotPaused {
        require(
            memeOfTheDay.ownerOf(tokenId) == msg.sender,
            "Only owner of token can put on sale"
        );
        require(!isOnSale[tokenId], "Token is already on sale!");

        isOnSale[tokenId] = true;
    }

    /**
     * @notice Removes a token from sale 
     * @param tokenId the id of the token to remove from sale
     */
    function removeFromSale(uint256 tokenId) external whenNotPaused {
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
    ) external payable whenNotPaused nonReentrant{
        require(isOnSale[tokenId], "Given token is not on sale");

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

        emit VotersFee(votersFee);
        emit CreatorFee(creatorFee);
        emit PlatformFee(platformFee);
        emit OwnerFee(ownerFee);


        //BLOCK SCOPING DUE TO STACK TOO DEEP ERROR !!!

    //    { //BLOCK SCOPE 1 START

            
        uint256 totVotes = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            totVotes += votes[i];
        }

        for (uint256 i = 0; i < voters.length; i++) {
            uint256 voterFee = votersFee * (votes[i]/totVotes); //No more div or mul because SafeMath checks are native to sol 0.8.0
            (bool success, ) = voters[i].call{value: voterFee}(""); //use call{value: }("") instead of Transfer since Istanbul fork! EIP 1884
            require(success, "Transfer failed.");
        }


    //    }  //BLOCK SCOPE 1 END

    //    {  //BLOCK SCOPE 2 START

              if (payCreator) {
           (bool success1, ) = memeOfTheDay.creatorOf(tokenId).call{value: creatorFee}("");  //use call{value: }("") instead of Transfer since Istanbul fork! EIP 1884
           require(success1, "Transfer failed.");
        }

    //    }  //BLOCK SCOPE 2 END

        {  //BLOCK SCOPE 3 Start

        (bool success2, ) = address(memeOfTheDayTreasury).call{value: platformFee}(""); //use call{value: }("") instead of Transfer since Istanbul fork! EIP 1884
         require(success2, "Transfer failed.");
        (bool success3, ) = memeOfTheDay.ownerOf(tokenId).call{value: ownerFee}("");  //use call{value: }("") instead of Transfer since Istanbul fork! EIP 1884
         require(success3, "Transfer failed.");

        }  //BLOCK SCOPE 3 END

        {  //BLOCK SCOPE 4 START

        memeOfTheDay.safeTransferFrom(
            memeOfTheDay.ownerOf(tokenId),
            msg.sender,
            tokenId,
            1,
            ""
        );

        isOnSale[tokenId] = false;

        }  //BLOCK SCOPE 4 END

        //BLOCK SCOPING END
    }

    function _getVotersFee(uint256 tokenPrice) internal view returns (uint256) {
        return
            tokenPrice / (1000) * (                                //No more div or mul because SafeMath checks are native since sol 0.8.0
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
                creatorFee = tokenPrice / (1000) * (            //No more div or mul becasue SafeMath checks are native to sol 0.8.0
                    uint256(memeOfTheDay.creatorFee(tokenId))
                );
            } else {
                creatorFee = tokenPrice / (1000) * (                //No more div or mul becasue SafeMath checks are native to sol 0.8.0
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
            tokenPrice / (1000) * (                             //No more div or mul becasue SafeMath checks are native to sol 0.8.0
                memeOfTheDaySaleParametersProvider.parameters(
                    memeOfTheDaySaleParametersProvider
                        .PLATFORM_FEE_PERCENT_INDEX()
                )
            );
    }

    function _getOwnerFee(
        uint256 votersFee,
        uint256 creatorFee,
        uint256 platformFee
    ) internal view returns (uint256) {

        //economic model "buyer pay fee", buyer needs to send to contract
        //token price including voters fee and platform fee
        return msg.value - (votersFee) - (creatorFee) - (platformFee);    //No more sub, add, div or mul becasue SafeMath checks are native to sol 0.8.0
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
        //buyer pays fees economic model check
        require(msg.value >= tokenPrice+votersFee+platformFee);
        uint256 ownerFee = _getOwnerFee(
            votersFee,
            creatorFee,
            platformFee
        );

        return (votersFee, creatorFee, platformFee, ownerFee);
    }

    //USED TO PAUSE THIS CONTRACT, ONLY POSSIBLE WHEN NOT PAUSED!
    function pause() public whenNotPaused onlyOwner {
        _pause();
    }

    //USED TO UNPAUSE THIS CONTRACT, ONLY POSSIBLE WHEN PAUSED!
    function unpause() public whenPaused onlyOwner {
        _unpause();
    }
}