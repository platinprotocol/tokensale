pragma solidity ^0.4.25; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

import "../PlatinToken.sol";


contract PlatinTokenMock is PlatinToken {
    
    function totalSupply() public view returns (uint256) {
        if (totalSupply_ > 0) 
            return totalSupply_ + 1;
        return 0;
    }
}
