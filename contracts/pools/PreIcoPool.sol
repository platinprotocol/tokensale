pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../PlatinPool.sol";


/**
 * @title PreIcoPool
 * @dev Pool contract that holds pre ico supply distribution table and capability. 
 */
contract PreIcoPool is PlatinPool {


    /**
     * @dev Constructor
     * @param _token address Address of the Platin Token contract                              
     */  
    constructor(PlatinToken _token) public PlatinPool(_token) {}

}