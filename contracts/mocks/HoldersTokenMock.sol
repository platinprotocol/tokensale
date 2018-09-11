pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../HoldersToken.sol";


contract HoldersTokenMock is HoldersToken {

    function removeZeroHolder() public {
        _removeHolder(address(0));
    }
}
