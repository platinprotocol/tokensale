pragma solidity ^0.4.25; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

import "../PlatinTGE.sol";
import "../PlatinToken.sol";
import "../PlatinICO.sol";


contract PlatinTGEMinICOMock is PlatinTGE {

    uint256 public constant ICO_AMOUNT = MIN_PURCHASE_AMOUNT * TOKEN_RATE;  
    uint256 public constant PRE_ICO_POOL_AMOUNT = SALES_SUPPLY - ICO_AMOUNT; 

    constructor(
        uint256 _tgeTime,
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
    PlatinTGE(_tgeTime, _token, _preIcoPool, _ico, _miningPool, _foundersPool, _employeesPool, _airdropsPool, _reservesPool, _advisorsPool, _ecosystemPool, _unsoldReserve)
    public {}
  
    function allocate() public {   
        token.allocate(PRE_ICO_POOL, PRE_ICO_POOL_AMOUNT);
        token.allocate(ICO, ICO_AMOUNT);
    }
}
