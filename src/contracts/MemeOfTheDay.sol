pragma solidity 0.5.0;

import "./ERC721Full.sol";

contract MemeOfTheDay is ERC721Full {
  string[] public hashes;
  mapping(string => bool) _hashExists;
  //tole je test

  constructor() ERC721Full("Meme", "MTD") public {
  }

  // E.G. hash = "QmWERhD123RLQQ"
  function mint(string memory _hash) public {
    require(!_hashExists[_hash]);
    uint _id = hashes.push(_hash);
    _mint(msg.sender, _id);
    _hashExists[_hash] = true;
  }

}
