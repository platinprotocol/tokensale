pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IVesting.sol";


/**
 * @title Token Vesting Mixin
 * @dev Token mixin that gives possibility for token holders to have vested amounts of tokens on their balances. 
 * Vesting rules are controlled by vesting contracts that should implement IVesting.sol interface contract.
 * Token should check a balance spot for transfer and transferFrom functions to use this feature.
 */
contract TokenVesting is ERC20 {
    using SafeMath for uint256;  

    // Vested struct
    struct Vested {
        uint256 amount; // vested amount
        IVesting vesting; // vesting contract
    }

    // list of vested amounts and vesting contract addresses
    mapping (address => Vested[]) public vested;

    // vesting event logging
    event Vesting(address indexed to, uint256 amount, address vesting);    

    // onlyVestingAuthorized modifier, override to restrict transfers with vestings
    modifier onlyVestingAuthorized() {
        _;
    }

    /**
     * @dev Get the vested list count
     * @param _who address Address owns vested list
     * @return uint256 Vested list count     
     */
    function vestedCount(address _who) public view returns (uint256) {
        return vested[_who].length;
    }

    /**
     * @dev Find out if the address has vested amounts
     * @param _who address Address checked for vested amounts
     * @return bool Returns true if address has vested amounts     
     */  
    function hasVested(address _who) public view returns (bool) {
        return vested[_who].length > 0;
    }

    /**
     * @dev Get balance vested to the current moment of time
     * @param _who address Address owns vested amounts
     * @return uint256 Balance vested to the current moment of time     
     */       
    function balanceVested(address _who) public view returns (uint256) {
        uint256 _balanceVested = 0;
        for (uint256 i = 0; i < vested[_who].length; i++) {
            _balanceVested = _balanceVested.add(vested[_who][i].vesting.balanceVested(vested[_who][i].amount));
        }
        return _balanceVested;
    } 

    /**
     * @dev Transfer tokens from one address to another with vesting
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @param _vesting address Address of vesting contract (could be zero to omit vesting)
     */
    function transferWithVesting(
        address _to, 
        uint256 _value, 
        address _vesting
    ) 
    public onlyVestingAuthorized returns (bool) 
    {        
        transfer(_to, _value);
        _vest(_to, _value, _vesting);
    }       

    /**
     * @dev Transfer tokens from one address to another with vesting
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @param _vesting address Address of vesting contract (could be zero to omit vesting)
     */
    function transferFromWithVesting(
        address _from, 
        address _to, 
        uint256 _value, 
        address _vesting
    ) 
    public onlyVestingAuthorized returns (bool) 
    {
        transferFrom(_from, _to, _value);
        _vest(_to, _value, _vesting);
    }   

    /**
     * @dev Make vesting for the amount using contract with vesting rules
     * @param _who address Address gets the vested amount
     * @param _amount uint256 Amount to vest
     * @param _vesting address Address of vesting contract (could be zero to omit vesting)     
     */ 
    function _vest(address _who, uint256 _amount, address _vesting) internal {
        if (_vesting != address(0)) {
            require(_who != address(0), "Vesting target address can't be zero.");
            require(_amount > 0, "Vesting amount should be > 0.");
            vested[_who].push(Vested(_amount, IVesting(_vesting)));
            emit Vesting(_who, _amount, _vesting);
        }
    }        
}
