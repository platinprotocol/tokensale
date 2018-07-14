pragma solidity ^0.4.24;


/**
 * @title PlatinVesting
 * @dev Platin Vesting contract interface
 */
contract PlatinVesting {
    function balanceVested(uint256 _vested) public view returns (uint256);
}
