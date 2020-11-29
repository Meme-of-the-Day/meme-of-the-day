// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MOTDTreasury is Ownable {
    event Paid(address from, uint256 amount);
    event Withdrawn(address by, uint256 amount);

    receive() external payable {
        emit Paid(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(
            amount <= address(this).balance,
            "Requested amount is higher than currently deposited value"
        );

        msg.sender.transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }
}
