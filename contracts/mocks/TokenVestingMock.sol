pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "../capabilities/TokenVesting.sol";


contract TokenVestingMock is StandardToken, TokenVesting {

    function zeroAddressVesting() public onlyVestingAuthorized {
        _vest(address(0), 1, address(1));
    }

    function zeroAmountVesting() public onlyVestingAuthorized {
        _vest(address(1), 0, address(1));
    }
}
