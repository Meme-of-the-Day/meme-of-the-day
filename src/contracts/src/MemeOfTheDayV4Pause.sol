// SPDX-License-Identifier: MIT

//This contract is an example of an Upgraded contract, At the end of the code you can find an additional function sayHello()
//This shall demonstrate, that it is possible to add functionality at the end of the code. It is very important to only append code
//and never change any order of variables, nor delete any of them, in order to avoid storage collisions!!
//Compare MemeOfTheDayV4Pause with MemeOfTheDayV3Pause to get a precise understanding! 

pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract MemeOfTheDayV4Pause is ERC1155Upgradeable, OwnableUpgradeable, PausableUpgradeable {

string[] public hashes;

    // Mapping for enforcing unique hashes
    mapping(string => bool) _hashExists; 

    // Mapping from ipfs picture hash to NFT tokenID
    mapping (string => uint256) private _hashToken;  

    mapping(uint256 => address) public creatorOf;
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => int256) public creatorFee;

    event MemeMinted(address creator, uint256 tokenId);

    function initialize() public initializer {
        __ERC1155_init("https://hub.textile.io/ipfs/bafybeiaz4sqwracygsux7moam3tcd7zng53f6gh4khzhsrlhkto473c5rq/tokenmetadata/{id}.json");
        __ERC165_init();
        __Ownable_init();
        __Pausable_init();
    }
    /**
     * @notice Changes the URI to fetch NFTs info from
     * @param _newUri   the new URI to fetch NFTs info from
     */
    function setUri(string memory _newUri) external whenNotPaused onlyOwner  {
        _setURI(_newUri);
    }

    /**
     * @notice Mints a new meme NFT
     * @param _hash IPFS hash of the NFT
     * @param _creatorFee custom fee to send to the creator, if is -1 it uses the default one set in the MOTDSaleParametersProviderContract
     */
    function mint(string memory _hash, int256 _creatorFee) public whenNotPaused {
        require(!_hashExists[_hash], "Token with this hash is already minted");

        hashes.push(_hash);
        uint256 _id = hashes.length - 1;
        _mint(msg.sender, _id, 1, "");

        _hashExists[_hash] = true;
        _hashToken[_hash] = _id;

        creatorOf[_id] = msg.sender;
        ownerOf[_id] = msg.sender;
        creatorFee[_id] = _creatorFee;

        emit MemeMinted(msg.sender, _id);
    }

    /**
     * @notice Returns the TokenID of meme
     * @return tokenID of the meme
     */
    function getTokenID(string memory _hash) public view whenNotPaused returns (uint256 tokenID) {
        return _hashToken[_hash];
    }

    /**
     * @notice Returns the number of minted memes
     * @return count the number of memes
     */
    function getMemesCount() public view whenNotPaused returns (uint256 count) {
        return hashes.length;
    }

    function pause() public whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() public whenPaused onlyOwner {
        _unpause();
    }

       function sayHello()public pure returns (string memory) {
        return "Hello from after the Proxy Upgrade!! I am the new function!";
    }

}