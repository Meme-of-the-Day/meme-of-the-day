// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeOfTheDay is ERC1155, Ownable {
    // Hashes of meme pictures on IPFS
    string[] public hashes;

    // Mapping for enforcing unique hashes
    mapping(string => bool) _hashExists;

    mapping(uint256 => address payable) public creatorOf;
    mapping(uint256 => address) public ownerOf;

    // Mapping from hash to NFT token ID
    mapping(string => address) private _hashToken;

    event MemeMinted(address creator, uint256 tokenId);

    constructor() public ERC1155("https://game.example/api/item/{id}.json") {}

    function mint(string memory _hash) public {
        require(!_hashExists[_hash], "Token with this hash is already minted");

        hashes.push(_hash);
        uint256 _id = hashes.length - 1;
        _mint(msg.sender, _id, 1, "");

        _hashExists[_hash] = true;

        creatorOf[_id] = msg.sender;
        ownerOf[_id] = msg.sender;

        emit MemeMinted(msg.sender, _id);
    }

    function getMemesCount() public view returns (uint256 count) {
        return hashes.length;
    }
}
