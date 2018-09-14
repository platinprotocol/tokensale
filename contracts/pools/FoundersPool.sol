pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../PlatinPool.sol";


/**
 * @title FoundersPool
 * @dev Pool contract that holds founders supply distribution table and capability. 
 */
contract FoundersPool is PlatinPool {


    /**
     * @dev Constructor
     * @param _token address Address of the Platin Token contract                              
     */  
    constructor(PlatinToken _token) public PlatinPool(_token) {}

}