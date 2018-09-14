pragma solidity ^0.4.24; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

import "../HoldersToken.sol";


contract HoldersTokenMock is HoldersToken {

    function removeZeroHolder() public {
        _removeHolder(address(0));
    }
}
