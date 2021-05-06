// SPDX-License-Identifier: MIT

//This contract is an example of an Upgraded contract, At the end of the code you can find an additional function sayHello()
//This shall demonstrate, that it is possible to add functionality at the end of the code. It is very important to only append code
//and never change any order of variables, nor delete any of them, in order to avoid storage collisions!!
//Compare MOTDTreasuryV4Pause with MOTDTreasuryV3Pause to get a precise understanding! 

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