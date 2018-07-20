pragma solidity ^0.4.24;


/**
 * @title IVesting
 * @dev Platin Vesting contract interface
 */
contract IVesting {
    /**
     * @dev Get balance vested to the current moment of time
     * @param _vested uint256 Amount of vested tokens
     * @return uint256 Balance vested to the current moment of time
     */
    function balanceVested(uint256 _vested) public view returns (uint256);
}
