pragma solidity ^0.4.24;


/**
 * @title IVesting
 * @dev Platin Vesting contract interface
 */
contract IVesting {
    function balanceVested(uint256 _vested) public view returns (uint256);
}
