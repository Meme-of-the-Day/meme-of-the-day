// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../../../node_modules/@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


/**
 * @title MOTDTreasury
 * @notice A contract which holds the platform fees coming from meme sales
 * @author MemeOfTheDay
 */
contract MOTDTreasuryV4Pause is OwnableUpgradeable, PausableUpgradeable {

    
    event Paid(address from, uint256 amount);
    event Withdrawn(address by, uint256 amount);
    
    

    //Due to UPGRADEABILITY, Initializer is used!
    function initialize() public initializer {
        __Ownable_init();
        __Pausable_init();
    }

    receive() external payable {
        emit Paid(msg.sender, msg.value);
    }

    /**
     * @notice Withdraws some funds from this contract
     * @param amount the amount of funds to winthdraw
     */
    function withdraw(uint256 amount) external onlyOwner whenNotPaused {
        require(
            amount <= address(this).balance,
            "Requested amount is higher than currently deposited value"
        );
       
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed.");
        
        emit Withdrawn(msg.sender, amount);
    }

    //USED TO PAUSE THIS CONTRACT, ONLY POSSIBLE WHEN NOT PAUSED!
    function pause() public whenNotPaused onlyOwner {
        _pause();
    }

    //USED TO UNPAUSE THIS CONTRACT, ONLY POSSIBLE WHEN PAUSED!
    function unpause() public whenPaused onlyOwner {
        _unpause();
    }

    function sayHello() public pure returns(string memory){
        return "Hello from after the Proxy Upgrade!! I am the new function!";
    }
     
}