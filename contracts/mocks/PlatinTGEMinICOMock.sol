pragma solidity ^0.4.24;

import "../PlatinTGE.sol";


import "../capabilities/IVesting.sol";
import "../PlatinPayoutProgram.sol";
import "../PlatinToken.sol";
import "../PlatinPreICO.sol";
import "../PlatinICO.sol";

contract PlatinTGEMinICOMock is PlatinTGE {

    uint256 public constant ICO_AMOUNT = MIN_PURCHASE_AMOUNT * TOKEN_RATE;  
    uint256 public constant PRE_ICO_AMOUNT = SALES_SUPPLY - ICO_AMOUNT; 

    constructor(
        PlatinToken _token, 
        PlatinPreICO _preIco, 
        PlatinICO _ico, 
        PlatinPayoutProgram _ppp,
        IVesting _holderVesting, 
        IVesting _unsoldVesting
    )
    PlatinTGE(_token, _preIco, _ico, _ppp, _holderVesting, _unsoldVesting)
    public {}
  
    function allocate() public {   
        token.allocate(address(preIco), PRE_ICO_AMOUNT, address(0));
        token.allocate(address(ico), ICO_AMOUNT, address(0));
    }

}
