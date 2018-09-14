pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../HoldersToken.sol";

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */


contract HoldersTokenMock is HoldersToken {

    function removeZeroHolder() public {
        _removeHolder(address(0));
    }
}
