pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../PlatinPool.sol";


/**
 * @title ReservesPool
 */
contract ReservesPool is PlatinPool {

    constructor(PlatinToken _token) public PlatinPool(_token) {}

}