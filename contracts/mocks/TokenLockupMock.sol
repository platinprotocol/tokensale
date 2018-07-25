pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../capabilities/TokenLockup.sol";


contract TokenLockupMock is StandardToken, TokenLockup {

    function zeroAddressLockup() public onlyLockupAuthorized {
        _lockup(address(0), 1, block.timestamp + 1); // solium-disable-line security/no-block-members
    }

    function zeroAmountLockup() public onlyLockupAuthorized {
        _lockup(address(1), 0, block.timestamp + 1); // solium-disable-line security/no-block-members
    }

    function lockupInPast() public onlyLockupAuthorized {
        _lockup(address(1), 1, block.timestamp); // solium-disable-line security/no-block-members        
    }
}
