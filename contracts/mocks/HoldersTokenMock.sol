pragma solidity ^0.4.24;

import "../capabilities/HoldersToken.sol";


contract HoldersTokenMock is HoldersToken {

    function removeZeroHolder() public {
        _removeHolder(address(0));
    }
}
