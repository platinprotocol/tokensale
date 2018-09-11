pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title Holders Token
 * @dev Extension to the OpenZepellin's StandardToken contract to track token holders.
 */
contract HoldersToken is StandardToken {
    using SafeMath for uint256;    

    // holders list
    address[] public holders;

    // holder number in the list
    mapping (address => uint256) public holderNumber;

    /**
     * @dev Get the holders count
     * @return uint256 Holders count
     */
    function holdersCount() public view returns (uint256) {
        return holders.length;
    }

    /**
     * @dev Transfer tokens from one address to another preserving token holders
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @return bool Returns true if the transfer was succeeded
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        _preserveHolders(msg.sender, _to, _value);
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer tokens from one address to another preserving token holders
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @return bool Returns true if the transfer was succeeded
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        _preserveHolders(_from, _to, _value);
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Remove holder from the holders list
     * @param _holder address Address of the holder to remove
     */
    function _removeHolder(address _holder) internal {
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

    /**
     * @dev Add holder to the holders list
     * @param _holder address Address of the holder to add   
     */
    function _addHolder(address _holder) internal {
        if (holderNumber[_holder] == 0) {
            holders.push(_holder);
            holderNumber[_holder] = holders.length;
        }
    }

    /**
     * @dev Preserve holders during transfers
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function _preserveHolders(address _from, address _to, uint256 _value) internal {
        _addHolder(_to);   
        if (balanceOf(_from).sub(_value) == 0) 
            _removeHolder(_from);
    }
}
