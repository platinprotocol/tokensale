pragma solidity ^0.4.24;

import "../PlatinTGE.sol";

import "../PlatinToken.sol";
import "../PlatinICO.sol";


contract PlatinTGEMock is PlatinTGE {

    constructor(
        PlatinToken _token, 
        address _preIcoPool, 
        address _ico,
        address _miningPool,
        address _foundersPool,
        address _employeesPool,
        address _airdropsPool,
        address _reservesPool,
        address _advisorsPool,
        address _ecosystemPool,
        address _unsoldReserve
    )
    PlatinTGE(_token, _preIcoPool, _ico, _miningPool, _foundersPool, _employeesPool, _airdropsPool, _reservesPool, _advisorsPool, _ecosystemPool, _unsoldReserve)
    public {}

    function allocateZeroAddress() public {
        token.allocate(address(0), 1);
    }

    function allocateZeroAmount() public {
        token.allocate(address(1), 0);
    }    

    function allocateMore() public {
        token.allocate(address(1), TOTAL_SUPPLY.add(1));
    }    
}
