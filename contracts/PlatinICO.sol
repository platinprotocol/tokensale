pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinICO
 */
contract PlatinICO is TimedCrowdsale, WhitelistedCrowdsale, Pausable {
    using SafeMath for uint256;

    // copied from "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
    bool public isFinalized = false; 

    // Lockup purchase
    bool lockup;

    // Amount of tokens sold
    uint256 public sold;

    // Platin TGE contract
    PlatinTGE public tge;

    // copied from "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
    event Finalized();   

    // tgeIsSet modifier
    modifier tgeIsSet() {
        require(tge != address(0), ""); // TODO: provide an error msg
        _;
    }


    /**
     * @dev Constructor
     */  
    constructor(uint256 _rate, address _wallet, ERC20 _token, uint256 _openingTime, uint256 _closingTime) // solium-disable-line arg-overflow
        Crowdsale(_rate, _wallet, _token) 
        TimedCrowdsale(_openingTime, _closingTime)
    public {}

    // set TGE contract
    function setTGE(PlatinTGE _tge) public onlyOwner {
        require(tge == address(0), ""); // TODO: provide an error msg
        require(_tge != address(0), ""); // TODO: provide an error msg
        tge = _tge;
        rate = tge.TOKEN_RATE();
    }

    /**
    * @dev Purchase and lockup purchased tokens for sender
    */
    function purchaseLockupTokens() public payable {
        lockup = true;
        buyTokens(msg.sender);
    }  

    /**
     * @dev  Extend parent behavior to deliver purchase
     * @param _beneficiary Address performing the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {
        require(token.transfer(_beneficiary, _tokenAmount), ""); // TODO: provide an error msg
    }

    /**
     * @dev Extend parent behavior to process purchase
     * @param _beneficiary Address receiving the tokens
     * @param _tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {
        require(sold.add(_tokenAmount) <= tge.ICO_AMOUNT(), ""); // TODO: provide an error msg

        sold = sold.add(_tokenAmount);

        if (lockup) {
            PlatinToken(token).lockup(_beneficiary, _tokenAmount);
            lockup = false;
        }    

        super._processPurchase(_beneficiary, _tokenAmount);
    }

    /**
     * @dev Must be called after crowdsale ends, to do some extra finalization
     * work. Calls the contract's finalization function.
     * copied from "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
     */
    function finalize() onlyOwner public {
        require(!isFinalized);
        require(hasClosed());

        finalization();
        emit Finalized();

        isFinalized = true;
    }

    // finalization, transfer unsold tokens to unsold tokens reserve
    function finalization() internal {
        token.transfer(tge.UNSOLD_ICO_RESERVE(), token.balanceOf(this));
    }

    /**
     * @dev Extend parent behavior requiring contract to be not paused and tge has been set and the min payment amount is received.
     * @param _beneficiary Token beneficiary
     * @param _weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _weiAmount
    )
        internal
        whenNotPaused
        tgeIsSet
    {
        require(_weiAmount >= tge.MIN_PURCHASE_AMOUNT(), ""); // TODO: provide an error msg
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }

    /**
     * @dev Override parent behavior to process lockup purchase if needed
     * @param _weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 _weiAmount)
        internal view returns (uint256)
    {
        uint256 _rate = rate;
        if (lockup)
            _rate = tge.TOKEN_RATE_LOCKUP();
        return _weiAmount.mul(_rate);
    }    
}    