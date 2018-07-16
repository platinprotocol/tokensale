pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinVesting.sol";


/**
 * @title PlatinStandardVesting
 * @dev Platin Standard Vesting contract
 */
contract PlatinStandardVesting is PlatinVesting {
    using SafeMath for uint256;

    // vesting months count
    uint8 public constant VESTING_MONTHS = 24;

    // vesting release dates
    // TODO revise vesting timestamps before going live
    uint256[VESTING_MONTHS] public VESTING_RELEASE_DATES = [ // solium-disable-line mixedcase
        1535803200, 1538395200, 1541073600, 1543665600, // 2018-09-01, 2018-10-01, 2018-11-01, 2018-12-01,
        1546344000, 1549022400, 1551441600, 1554120000, // 2019-01-01, 2019-02-01, 2019-03-01, 2019-04-01,
        1556712000, 1559390400, 1561982400, 1564660800, // 2019-05-01, 2019-06-01, 2019-07-01, 2019-08-01,
        1567339200, 1569931200, 1572609600, 1575201600, // 2019-09-01, 2019-10-01, 2019-11-01, 2019-12-01,
        1577880000, 1580558400, 1583064000, 1585742400, // 2020-01-01, 2020-02-01, 2020-03-01, 2020-04-01,
        1588334400, 1591012800, 1593604800, 1596283200  // 2020-05-01, 2020-06-01, 2020-07-01, 2020-08-01 @ 12:00:00 GMT
    ]; 

    // balance vested
    function balanceVested(uint256 _vested) public view returns (uint256) {
        uint256 _timestamp = block.timestamp; // solium-disable-line security/no-block-members
        uint256 _vestingEnd = VESTING_RELEASE_DATES[VESTING_MONTHS];

        if (_timestamp > _vestingEnd)
            return 0;

        uint256 _chunk = _vested.div(VESTING_MONTHS);
        uint256 _balanceVested = _vested;
        
        for (uint8 m = 0; m < VESTING_MONTHS; m++) {
            if (_timestamp < VESTING_RELEASE_DATES[m])
                break;
            _balanceVested = _balanceVested.sub(_chunk);
        }

        if (_balanceVested < _chunk)
            _balanceVested = 0;

        return _balanceVested;
    }
}
