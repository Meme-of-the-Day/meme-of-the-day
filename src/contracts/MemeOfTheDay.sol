pragma solidity 0.5.0;

import "./ERC721Full.sol";

contract MemeOfTheDay is ERC721Full {

  //list of all NFTs identified by picture hash
  string[] public hashes;
  //structure to prevent duplication of pictures
  mapping(string => bool) _hashExists;
  //structure to return NFT TokenID on behalf of his picture hash
  mapping(string => uint256) _TokenIDs;

  constructor() ERC721Full("Meme", "MTD") public {
  }

  // E.G. hash = "QmWERhD123RLQQ"
  function mint(string memory _hash) public {
    require(!_hashExists[_hash]);
    uint _id = hashes.push(_hash);
    _mint(msg.sender, _id);
    _hashExists[_hash] = true;
    _TokenIDs[_hash] = _id;
  }

  function getTokenId(string memory _hash) public view returns (uint256 _TokenID) {
    return _TokenIDs[_hash];
  }

}
