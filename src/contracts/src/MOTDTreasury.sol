// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MOTDTreasury
 * @notice A contract which holds the platform fees coming from meme sales
 * @author MemeOfTheDay
 */
contract MOTDTreasury is Ownable {
    event Paid(address from, uint256 amount);
    event Withdrawn(address by, uint256 amount);

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

        msg.sender.transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }
}
