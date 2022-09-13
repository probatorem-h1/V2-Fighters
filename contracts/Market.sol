// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (utils/Address.sol)

pragma solidity ^0.8.0;

contract Marketplace {
    address testAddress;

    function isMember(address user) public view returns (bool) {
        if (user == testAddress) {
            return true;
        }
        return false;
    }

    function addToEscrow(address _user) external payable {
        payable(_user).transfer(msg.value);
    }
}
