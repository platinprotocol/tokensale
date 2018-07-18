pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title Token Lockup Mixin
 * @dev Token should have spotTransfer check for transfer and transferFrom functions
 */
contract TokenLockup is ERC20 {
    using SafeMath for uint256;  

    // LockedUp struct
    struct LockedUp {
        uint256 amount;
        uint256 release;
    }

    // list of lockedup amount and release timestamps
    mapping (address => LockedUp[]) public lockedup;

    // onlyLockupAuthorized modifier
    modifier onlyLockupAuthorized() {
        _;
    }


    // lockedup list count
    function lockedUpCount(address _who) public view returns (uint256) {
        return lockedup[_who].length;
    }

    // has address locked up amount
    function hasLockedUp(address _who) public view returns (bool) {
        return lockedup[_who].length > 0;
    }    

    // balance locked up
    function balanceLokedUp(address _who) public view returns (uint256) {
        uint256 _balanceLokedUp;
        for (uint256 i; i < lockedup[_who].length; i++) {
            if (lockedup[_who][i].release < block.timestamp) // solium-disable-line security/no-block-members
                _balanceLokedUp = _balanceLokedUp.add(lockedup[_who][i].amount);
        }
        return _balanceLokedUp;
    }    

    // transfer tokens with lockup 
    function transferWithLockup(
        address _to, 
        uint256 _value, 
        uint256 _release
    ) 
    public onlyLockupAuthorized returns (bool) 
    {        
        lockup(_to, _value, _release);
        return transfer(_to, _value);
    }       

    // transferFrom tokens with lockup 
    function transferFromWithLockup(
        address _from, 
        address _to, 
        uint256 _value, 
        uint256 _release
    ) 
    public onlyLockupAuthorized returns (bool) 
    {
        lockup(_to, _value, _release);
        return transferFrom(_from, _to, _value);
    }     

    // lock up internal function
    function lockup(address _who, uint256 _amount, uint256 _release) internal {
        if (_release > 0) {
            require(_who != address(0), ""); // TODO: provide an error msg
            require(_amount > 0, ""); // TODO: provide an error msg     
            // TODO: provide an error msg
            require(_release > block.timestamp, ""); // solium-disable-line security/no-block-members 
            lockedup[_who].push(LockedUp(_amount, _release));
        }            
    }      

}
