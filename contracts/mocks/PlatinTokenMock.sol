pragma solidity ^0.4.24;

import "../PlatinToken.sol";


contract PlatinTokenMock is PlatinToken {
    function totalSupply() public view returns (uint256) {
        if (totalSupply_ > 0) 
            return totalSupply_ + 1;
        return 0;
    }
}
