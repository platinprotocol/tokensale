pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../PlatinPool.sol";


/**
 * @title AdvisorsPool
 * @dev Pool contract that holds advisors supply distribution table and capability.
 */
contract AdvisorsPool is PlatinPool {


    /**
     * @dev Constructor
     * @param _token address Address of the Platin Token contract                              
     */  
    constructor(PlatinToken _token) public PlatinPool(_token) {}

}