pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinICO
 * @dev Platin public sales contract. Before purchase customers should be whitelisted
 * during KYC/AML procedure. Tokens can be purchased with and without lockup.
 * Locked up tokens purchase has special token rate. When ICO ends, unsold tokens are
 * distributed to the unsold token reserve with lockup.
 * All constants for processing purchases and for finalization are stored in the TGE contract.
 * Due to the solidity inheritance limitations the code of OpenZeppelin's FinalizableCrowdsale
 * contract is copied directly to this contract to use it's finalize feature.
 */
contract PlatinICO is TimedCrowdsale, WhitelistedCrowdsale, Pausable {
    using SafeMath for uint256;

    // copied from the "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol"
    bool public isFinalized = false; 

    // Lockup purchase
    bool lockup;

    // Amount of sold tokens 
    uint256 public sold;

    // Platin TGE contract
    PlatinTGE public tge;

    // copied from the "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol"
    event Finalized();   


    /**
     * @dev Constructor
     * @param _rate uint256 Number of token units a buyer gets per wei
     * @param _wallet address Address where collected funds will be forwarded to
     * @param _token address Address of the token being sold  
     * @param _openingTime uint256 Crowdsale opening time
     * @param _closingTime uint256 Crowdsale closing time        
     */  
    constructor(
        uint256 _rate, 
        address _wallet, 
        ERC20 _token, 
        uint256 _openingTime, 
        uint256 _closingTime
    )
    Crowdsale(_rate, _wallet, _token) 
    TimedCrowdsale(_openingTime, _closingTime)
    public 
    {}

    /**
     * @dev Set TGE contract
     * @param _tge address PlatinTGE contract address    
     */
    function setTGE(PlatinTGE _tge) external onlyOwner {
        require(tge == address(0), "TGE is already set.");
        require(_tge != address(0), "TGE address can't be zero.");
        tge = _tge;
        rate = tge.TOKEN_RATE();
    }

    /**
     * @dev Purchase and lockup purchased tokens for the sender
     */
    function buyLockupTokens(address _beneficiary) external payable {
        lockup = true;
        buyTokens(_beneficiary);
    }  

    /**
     * @dev Must be called after crowdsale ends, to do some extra finalization
     * work. Calls the contract's finalization function.
     * copied from the "openzeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol"
     */
    function finalize() external onlyOwner {
        require(!isFinalized, "ICO is already finalized.");
        require(hasClosed(), "ICO should be closed.");

        finalization();
        emit Finalized();

        isFinalized = true;
    }     

    /**
     * @dev Extend parent behavior to deliver purchase
     * @param _beneficiary address Address performing the token purchase
     * @param _tokenAmount uint256 Number of tokens to be emitted
     */
    function _deliverTokens(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {
        if (lockup) {
            uint256[] memory _lockups = new uint256[](2);
            _lockups[0] = block.timestamp + tge.ICO_LOCKUP_PERIOD(); // solium-disable-line security/no-block-members
            _lockups[1] = _tokenAmount;
            PlatinToken(token).transferWithLockup(
                _beneficiary, 
                _tokenAmount,
                _lockups,
                false);
            lockup = false;   
        } else {
            PlatinToken(token).transfer(
                _beneficiary, 
                _tokenAmount);
        }
    }

    /**
     * @dev Extend parent behavior to process purchase
     * @param _beneficiary address Address receiving the tokens
     * @param _tokenAmount uint256 Number of tokens to be purchased
     */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {
        require(sold.add(_tokenAmount) <= tge.ICO_AMOUNT(), "Can't be sold more than ICO amount.");
        sold = sold.add(_tokenAmount);
        super._processPurchase(_beneficiary, _tokenAmount);
    }  

    /**
     * @dev Finalization, transfer unsold tokens to the reserve address with lockup
     */    
    function finalization() internal {
        uint256 _unsold = token.balanceOf(this);
        if (_unsold > 0) {
            uint256[] memory _lockups = new uint256[](2);
            _lockups[0] = block.timestamp + tge.UNSOLD_LOCKUP_PERIOD(); // solium-disable-line security/no-block-members
            _lockups[1] = _unsold;            
            PlatinToken(token).transferWithLockup(
                tge.UNSOLD_RESERVE(),
                _unsold,
                _lockups,
                false);
        }
    }

    /**
     * @dev Extend parent behavior requiring contract to be not paused and the min purchase amount is received.
     * @param _beneficiary address Token beneficiary
     * @param _weiAmount uint256 Amount of wei contributed
     */
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _weiAmount
    )
        internal
        whenNotPaused
    {
        require(_weiAmount >= tge.MIN_PURCHASE_AMOUNT(), "Insufficient funds to make the purchase.");
        super._preValidatePurchase(_beneficiary, _weiAmount);
    } 

    /**
     * @dev Override parent behavior to process lockup purchase if needed
     * @param _weiAmount uint256 Value in wei to be converted into tokens
     * @return uint256 Number of tokens that can be purchased with the specified _weiAmount
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