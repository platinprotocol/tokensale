pragma solidity ^0.4.24;

import "../PlatinTGE.sol";


contract PlatinTGEMock is PlatinTGE {

    function allocateTo(address to, uint256 amount) public {
        token.allocate(to, amount, address(0));
    }

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
