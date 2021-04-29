// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


/**
 * @title MOTDTreasury
 * @notice A contract which holds the platform fees coming from meme sales
 * @author MemeOfTheDay
 */
contract MOTDTreasuryV2 is OwnableUpgradeable {

    
    event Paid(address from, uint256 amount);
    event Withdrawn(address by, uint256 amount);
    
    


    function initialize() public initializer {
        __Ownable_init();
    }

    receive() external payable {
        emit Paid(msg.sender, msg.value);
    }

    /**
     * @notice Withdraws some funds from this contracy
     * @param amount the amount of funds to winthdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(
            amount <= address(this).balance,
            "Requested amount is higher than currently deposited value"
        );
       
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
        
        emit Withdrawn(msg.sender, amount);
    }

    function sayHello() public pure returns(string memory){
        return "Hello from after the upgrade!";
    }
 
}