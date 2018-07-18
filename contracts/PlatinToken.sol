pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/NoOwner.sol";
import "openzeppelin-solidity/contracts/ownership/rbac/RBAC.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./capabilities/HoldersToken.sol";
import "./capabilities/TokenLockup.sol";
import "./capabilities/TokenVesting.sol";
import "./PlatinTGE.sol";
import "./PlatinICO.sol";


/**
 * @title PlatinToken
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

    // onlyLockupAuthorized modifier
    modifier onlyLockupAuthorized() {
        require(tge.LOCKUP_AUTHORIZED(msg.sender), ""); // TODO: provide an error msg
        _;
    }

    // onlyVestingAuthorized modifier
    modifier onlyVestingAuthorized() {
        require(tge.VESTING_AUTHORIZED(msg.sender), ""); // TODO: provide an error msg
        _;
    }

    // spotTransfer modifier
    modifier spotTransfer(address _from, uint256 _value) {
        require(_value <= balanceSpot(_from), ""); // TODO: provide an error msg
        _;
    }

    // onlyTGE modifier
    modifier onlyTGE() {
        require(msg.sender == address(tge), ""); // TODO: provide an error msg
        _;
    }


    // set TGE contract
    function setTGE(PlatinTGE _tge) public onlyOwner {
        require(tge == address(0), ""); // TODO: provide an error msg
        require(_tge != address(0), ""); // TODO: provide an error msg
        tge = _tge;
    }

    // allocate tokens during TGE
    function allocate(address _to, uint256 _amount, address _vesting) public onlyTGE returns (bool) {
        require(_to != address(0), ""); // TODO: provide an error msg
        require(_amount > 0, ""); // TODO: provide an error msg

        vesting(_to, _amount, _vesting);
        
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        require(totalSupply_ <= tge.TOTAL_SUPPLY(), ""); // TODO: provide an error msg

        emit Allocate(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;        
    }  

    // balance spot due the vested and lockup amounts
    function balanceSpot(address _who) public view returns (uint256) {
        uint256 _balanceSpot = balanceOf(_who);
        _balanceSpot = _balanceSpot.sub(balanceVested(_who));
        _balanceSpot = _balanceSpot.sub(balanceLokedUp(_who));
        return _balanceSpot;
    }     
       
    // standard transfer function with the spot transfer check due vesting and lockup amounts and platin payout program
    function transfer(address _to, uint256 _value) public whenNotPaused spotTransfer(msg.sender, _value) returns (bool) {
        if (_to == address(tge.ppp())) {
            require(super.transfer(_to, _value), ""); // TODO: provide an error msg
            return tge.ppp().payout(msg.sender, _value);
        } else {
            return super.transfer(_to, _value);
        }
    }

    // standard transferFrom function with the spot transfer check due vesting and lockup amounts and platin payout program
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused spotTransfer(_from, _value) returns (bool) {
        if (_to == address(tge.ppp())) {
            require(super.transferFrom(_from, _to, _value), ""); // TODO: provide an error msg
            return tge.ppp().payout(_from, _value);
        } else {     
            return super.transferFrom(_from, _to, _value);
        }        
    }
}
