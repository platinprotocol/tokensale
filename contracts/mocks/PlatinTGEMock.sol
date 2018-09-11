pragma solidity ^0.4.24;

import "../PlatinTGE.sol";


import "../capabilities/IVesting.sol";
import "../PlatinToken.sol";
import "../PlatinPreICO.sol";
import "../PlatinICO.sol";


contract PlatinTGEMock is PlatinTGE {

    constructor(
        PlatinToken _token, 
        PlatinPreICO _preIco, 
        PlatinICO _ico,
        IVesting _holderVesting, 
        IVesting _unsoldVesting
    )
    PlatinTGE(_token, _preIco, _ico, _holderVesting, _unsoldVesting)
    public {}

    function allocateZeroAddress() public {
        token.allocate(address(0), 1, address(0));
    }

    function allocateZeroAmount() public {
        token.allocate(address(1), 0, address(0));
    }    

    function allocateMore() public {
        token.allocate(address(1), TOTAL_SUPPLY.add(1), address(0));
    }    
}
