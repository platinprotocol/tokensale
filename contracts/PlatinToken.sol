pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/NoOwner.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./capabilities/HoldersToken.sol";
import "./capabilities/TokenLockup.sol";
import "./capabilities/TokenVesting.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinToken
 * @dev Platin PTNX Token contract. Tokens are allocated during TGE. Token
 * uses holders list, lockup, vesting and Platin Payout Program capabilities.
 */
contract PlatinToken is HoldersToken, TokenLockup, TokenVesting, NoOwner, Pausable {
    using SafeMath for uint256;

    string public constant name = "Platin Token"; // solium-disable-line uppercase
    string public constant symbol = "PTNX"; // solium-disable-line uppercase
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    // Platin TGE contract
    PlatinTGE public tge;

    // allocation event logging
    event Allocate(address indexed to, uint256 amount);

    // onlyLockupAuthorized modifier, restrict lockup to the specified list of addresses
    modifier onlyLockupAuthorized() {
        require(tge.LOCKUP_AUTHORIZED(msg.sender), "Unauthorized lockup attempt.");
        _;
    }

    // onlyVestingAuthorized modifier, restrict vesting to the specified list of addresses
    modifier onlyVestingAuthorized() {
        require(tge.VESTING_AUTHORIZED(msg.sender), "Unauthorized vesting attempt.");
        _;
    }

    // spotTransfer modifier, check balance spot on transfer
    modifier spotTransfer(address _from, uint256 _value) {
        require(_value <= balanceSpot(_from), "Attempt to transfer more than balance spot.");
        _;
    }

    // onlyTGE modifier, restrict to the TGE contract only
    modifier onlyTGE() {
        require(msg.sender == address(tge), "Only TGE method.");
        _;
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
     * @dev Allocate tokens during TGE, amount could be vested
     * @param _to address Address gets the tokens
     * @param _amount uint256 Amount to allocate
     * @param _vesting address Address of vesting contract (could be zero to omit vesting)  
     * @return bool Returns true if the allocation was succeeded
     */ 
    function allocate(address _to, uint256 _amount, address _vesting) external onlyTGE returns (bool) {
        require(_to != address(0), "Allocate To address can't be zero");
        require(_amount > 0, "Allocate amount should be > 0.");

        vesting(_to, _amount, _vesting);
        
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        require(totalSupply_ <= tge.TOTAL_SUPPLY(), "Can't allocate more than TOTAL SUPPLY.");

        emit Allocate(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;        
    }  

    /**
     * @dev Get balance spot for the current moment of time
     * @param _who address Address owns balance spot
     * @return uint256 Balance spot for the current moment of time     
     */   
    function balanceSpot(address _who) public view returns (uint256) {
        uint256 _balanceSpot = balanceOf(_who);
        _balanceSpot = _balanceSpot.sub(balanceVested(_who));
        _balanceSpot = _balanceSpot.sub(balanceLokedUp(_who));
        return _balanceSpot;
    }     
       
    /**
     * @dev Transfer tokens from one address to another with ppp functionality
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @return bool Returns true if the transfer was succeeded
     */
    function transfer(address _to, uint256 _value) public whenNotPaused spotTransfer(msg.sender, _value) returns (bool) {
        if (_to == address(tge.ppp())) {
            require(super.transfer(_to, _value), "Transfer to PPP is failed.");
            return tge.ppp().payout(msg.sender, _value);
        } else {
            return super.transfer(_to, _value);
        }
    }

    /**
     * @dev Transfer tokens from one address to another with ppp functionality
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @return bool Returns true if the transfer was succeeded
     */
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused spotTransfer(_from, _value) returns (bool) {
        if (_to == address(tge.ppp())) {
            require(super.transferFrom(_from, _to, _value), "TransferFrom to PPP is failed.");
            return tge.ppp().payout(_from, _value);
        } else {     
            return super.transferFrom(_from, _to, _value);
        }        
    }
}
