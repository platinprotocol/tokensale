pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title Platin Payout Program
 * @dev This contract holds a part of the unsold amount of tokens remaining from the ICO.
 * A token holder can send tokens to this contract and than gets back multiplied token amount,
 * but this amount will be locked up for the PPP lockup period of time. The multiplier and
 * the PPP lockup period are stored as constants in the TGE contract.
 */
contract PlatinPayoutProgram is HasNoEther {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;

    // Platin TGE contract
    PlatinTGE public tge;

    // onlyToken modifier, restrict to the Token contract only
    modifier onlyToken() {
        require(msg.sender == address(token), "Token only method");
        _;
    }


    /**
     * @dev Constructor
     * @param _token address PlatinToken contract address  
     */  
    constructor(
        PlatinToken _token
    ) public {
        require(_token != address(0), "Token address can't be zero.");
        token = _token;
    }

    /**
     * @dev Set TGE contract
     * @param _tge address PlatinTGE contract address    
     */
    function setTGE(PlatinTGE _tge) external onlyOwner {
        require(tge == address(0), "TGE is already set.");
        require(_tge != address(0), "TGE address can't be zero.");
        tge = _tge;
    }

    /**
     * @dev Payout and lockup tokens back to the sent tokens.
     * @param _beneficiary address Address sent tokens and gets payout 
     * @param _amount uint256 Amount of sent tokens
     * @return bool Returns true if the payout was succeeded
     */
    function payout(address _beneficiary, uint256 _amount) external onlyToken returns (bool) {
        uint256 _payout = _amount.mul(tge.PPP_MULTILPIER());
        require(_payout <= token.balanceOf(this), "Insufficient PPP balance to make the payout.");
        // solium-disable-next-line security/no-block-members
        return token.transferWithLockup(_beneficiary, _payout, block.timestamp + tge.PPP_LOCKUP_PERIOD());
    }
} 

