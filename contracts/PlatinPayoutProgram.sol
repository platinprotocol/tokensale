pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title Platin Payout Program
 */
contract PlatinPayoutProgram is Ownable {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;

    // Platin TGE contract
    PlatinTGE public tge;

    // onlyToken modifier
    modifier onlyToken() {
        require(msg.sender == address(token), ""); // TODO: provide an error msg
        _;
    }


    /**
     * @dev Constructor
     */  
    constructor(
        PlatinToken _token
    ) public {
        require(_token != address(0), ""); // TODO: provide an error msg
        token = _token;
    }

    // set TGE contract
    function setTGE(PlatinTGE _tge) public onlyOwner {
        require(tge == address(0), ""); // TODO: provide an error msg
        require(_tge != address(0), ""); // TODO: provide an error msg
        tge = _tge;
    }

    // payout
    function payout(address _beneficiary, uint256 _amount) public onlyToken returns (bool) {
        uint256 _payout = _amount.mul(tge.PPP_MULTILPIER());
        require(_payout <= token.balanceOf(this), ""); // TODO: provide an error msg
        // solium-disable-next-line security/no-block-members
        return token.transferWithLockup(_beneficiary, _payout, block.timestamp + tge.PPP_LOCKUP_PERIOD());
    }
} 

