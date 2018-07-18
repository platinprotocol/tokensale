pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IVesting.sol";


/**
 * @title Token Vesting Mixin
 * @dev Token should have spotTransfer check for transfer and transferFrom functions 
 */
contract TokenVesting is ERC20 {
    using SafeMath for uint256;  

    // Vested struct
    struct Vested {
        uint256 amount;
        IVesting vesting;
    }

    // list of vested amount and vesting contract address
    mapping (address => Vested[]) public vested;

    // onlyVestingAuthorized modifier
    modifier onlyVestingAuthorized() {
        _;
    }

    // vested list count
    function vestedCount(address _who) public view returns (uint256) {
        return vested[_who].length;
    }

    // has address vested amount
    function hasVested(address _who) public view returns (bool) {
        return vested[_who].length > 0;
    }

    // balance vested
    function balanceVested(address _who) public view returns (uint256) {
        uint256 _balanceVested;
        for (uint256 i; i < vested[_who].length; i++) {
            _balanceVested = _balanceVested.add(vested[_who][i].vesting.balanceVested(vested[_who][i].amount));
        }
        return _balanceVested;
    } 

    // transfer tokens with vesting 
    function transferWithVesting(
        address _to, 
        uint256 _value, 
        address _vesting
    ) 
    public onlyVestingAuthorized returns (bool) 
    {        
        vesting(_to, _value, _vesting);
        return transfer(_to, _value);
    }       

    // transferFrom tokens with vesting 
    function transferFromWithVesting(
        address _from, 
        address _to, 
        uint256 _value, 
        address _vesting
    ) 
    public onlyVestingAuthorized returns (bool) 
    {
        vesting(_to, _value, _vesting);
        return transferFrom(_from, _to, _value);
    }   

    // vesting internal function
    function vesting(address _who, uint256 _amount, address _vesting) internal {
        if (_vesting != address(0)) {
            require(_who != address(0), ""); // TODO: provide an error msg
            require(_amount > 0, ""); // TODO: provide an error msg
            vested[_who].push(Vested(_amount, IVesting(_vesting)));
        }
    }        

}
