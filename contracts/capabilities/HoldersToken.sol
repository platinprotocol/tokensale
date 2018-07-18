pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title Holders Token
 */
contract HoldersToken is StandardToken {
    using SafeMath for uint256;    

    // holders list
    address[] public holders;

    // holder number
    mapping (address => uint256) public holderNumber;

    // get holders count
    function getHoldersCount() public view returns (uint256) {
        return holders.length;
    }

    // standard transfer function with preserve holders call
    function transfer(address _to, uint256 _value) public returns (bool) {
        preserveHolders(msg.sender, _to, _value);
        return super.transfer(_to, _value);
    }

    // standard transferFrom function with preserve holders call
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        preserveHolders(_from, _to, _value);
        return super.transferFrom(_from, _to, _value);
    }

    // remove holder from the holders list
    function removeHolder(address _holder) internal {
        uint256 _number = holderNumber[_holder];

        if (_number == 0 || holders.length == 0 || _number > holders.length)
            return;

        uint256 _index = _number.sub(1);
        uint256 _lastIndex = holders.length.sub(1);
        address _lastHolder = holders[_lastIndex];

        if (_index != _lastIndex) {
            holders[_index] = _lastHolder;
            holderNumber[_lastHolder] = _number;
        }

        holderNumber[_holder] = 0;
        holders.length = _lastIndex;
    } 

    // add holder to the holders list
    function addHolder(address _holder) internal {
        if (holderNumber[_holder] == 0) {
            holders.push(_holder);
            holderNumber[_holder] = holders.length;
        }
    }

    // preserve holders
    function preserveHolders(address _from, address _to, uint256 _value) internal {
        addHolder(_to);   
        if (balanceOf(_from).sub(_value) == 0) 
            removeHolder(_from);
    }
}
