pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title Token Lockup Mixin
 * @dev Token mixin that gives possibility for token holders to have locked up (till release time) amounts of tokens on their balances. 
 * Token should check a balance spot for transfer and transferFrom functions to use this feature.
 */
contract TokenLockup is ERC20 {
    using SafeMath for uint256;  

    // LockedUp struct
    struct LockedUp {
        uint256 amount; // lockedup amount
        uint256 release; // release timestamp
    }

    // list of lockedup amounts and release timestamps
    mapping (address => LockedUp[]) public lockedup;

    // onlyLockupAuthorized modifier, override to restrict transfers with lockup
    modifier onlyLockupAuthorized() {
        _;
    }


    /**
     * @dev Get the lockedup list count
     * @param _who address Address owns lockedup list
     * @return uint256 Lockedup list count     
     */
    function lockedUpCount(address _who) public view returns (uint256) {
        return lockedup[_who].length;
    }

    /**
     * @dev Find out if the address has locked up amounts
     * @param _who address Address checked for lockedup amounts
     * @return bool Returns true if address has lockedup amounts     
     */    
    function hasLockedUp(address _who) public view returns (bool) {
        return lockedup[_who].length > 0;
    }    

    /**
     * @dev Get balance locked up to the current moment of time
     * @param _who address Address owns lockedup amounts
     * @return uint256 Balance locked up to the current moment of time     
     */       
    function balanceLokedUp(address _who) public view returns (uint256) {
        uint256 _balanceLokedUp;
        for (uint256 i; i < lockedup[_who].length; i++) {
            if (lockedup[_who][i].release < block.timestamp) // solium-disable-line security/no-block-members
                _balanceLokedUp = _balanceLokedUp.add(lockedup[_who][i].amount);
        }
        return _balanceLokedUp;
    }    

    /**
     * @dev Transfer tokens from one address to another with lockup
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @param _release uint256 Release timestamp       
     * @return bool Returns true if the transfer was succeeded
     */
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

    /**
     * @dev Transfer tokens from one address to another with lockup
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @param _release uint256 Release timestamp       
     * @return bool Returns true if the transfer was succeeded
     */
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

    /**
     * @dev Lockup amount till release time
     * @param _who address Address gets the lockedup amount
     * @param _amount uint256 Amount to lockup
     * @param _release uint256 Release timestamp     
     */     
    function lockup(address _who, uint256 _amount, uint256 _release) internal {
        if (_release > 0) {
            require(_who != address(0), "Lockup target address can't be zero.");
            require(_amount > 0, "Lockup amount should be > 0.");   
            require(_release > block.timestamp, "Lockup release time should be > now."); // solium-disable-line security/no-block-members 
            lockedup[_who].push(LockedUp(_amount, _release));
        }            
    }      
}
