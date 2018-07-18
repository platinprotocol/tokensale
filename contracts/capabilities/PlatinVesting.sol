pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IVesting.sol";


/**
 * @title PlatinVesting
 * @dev Platin Vesting standard implementation contract 
 */
contract PlatinVesting is IVesting {
    using SafeMath for uint256;

    // vesting parts count
    uint256 public vestingParts; // solium-disable-line mixedcase

    // vesting releases timestamps
    uint256[] public vestingReleases;


    /**
     * @dev Constructor
     */  
    constructor(uint256 _vestingParts, uint256[] _vestingReleases) public {
        require(_vestingParts > 0, ""); // TODO: provide an error msg 
        require(_vestingReleases.length == _vestingParts, ""); // TODO: provide an error msg
        vestingParts = _vestingParts;
        vestingReleases = _vestingReleases;
    }

    // balance vested to the current moment of time
    function balanceVested(uint256 _vested) public view returns (uint256) {
        uint256 _timestamp = block.timestamp; // solium-disable-line security/no-block-members
        uint256 _vestingEnd = vestingReleases[vestingParts];

        if (_timestamp > _vestingEnd)
            return 0;

        uint256 _chunk = _vested.div(vestingParts);
        uint256 _balanceVested = _vested;
        
        for (uint8 i = 0; i < vestingParts; i++) {
            if (_timestamp < vestingReleases[i])
                break;
            _balanceVested = _balanceVested.sub(_chunk);
        }

        if (_balanceVested < _chunk)
            _balanceVested = 0;

        return _balanceVested;
    }
}
