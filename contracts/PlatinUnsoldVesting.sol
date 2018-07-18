pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./capabilities/PlatinVesting.sol";


/**
 * @title PlatinUnsoldVesting
 * @dev Platin Unsold Vesting contract
 */
contract PlatinUnsoldVesting is PlatinVesting {
    using SafeMath for uint256;

    // vesting parts count
    uint8 public constant VESTING_PARTS = 4;

    // vesting release dates
    // TODO revise vesting timestamps before going live
    uint256[] public VESTING_RELEASES = [ // solium-disable-line mixedcase
        1569931200, 1601553600, 1633089600, 1664625600 // 2019-10-01, 2020-10-01, 2021-10-01, 2022-10-01 @ 12:00:00 GMT
    ]; 

    /**
     * @dev Constructor
     */  
    constructor() PlatinVesting(VESTING_PARTS, VESTING_RELEASES) public {}
}
