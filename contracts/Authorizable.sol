pragma solidity ^0.4.24; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Authorizable
 * @dev Authorizable contract holds a list of control addresses that authorized to do smth.
 */
contract Authorizable is Ownable {

    // List of authorized (control) addresses
    mapping (address => bool) public authorized;

    // Authorize event logging
    event Authorize(address indexed who);

    // UnAuthorize event logging
    event UnAuthorize(address indexed who);

    // onlyAuthorized modifier, restrict to the owner and the list of authorized addresses
    modifier onlyAuthorized() {
        require(msg.sender == owner || authorized[msg.sender], "Not Authorized.");
        _;
    }

    /**
     * @dev Authorize given address
     * @param _who address Address to authorize 
     */
    function authorize(address _who) public onlyOwner {
        require(_who != address(0), "Address can't be zero.");
        require(!authorized[_who], "Already authorized");

        authorized[_who] = true;
        emit Authorize(_who);
    }

    /**
     * @dev unAuthorize given address
     * @param _who address Address to unauthorize 
     */
    function unAuthorize(address _who) public onlyOwner {
        require(_who != address(0), "Address can't be zero.");
        require(authorized[_who], "Address is not authorized");

        authorized[_who] = false;
        emit UnAuthorize(_who);
    }
}
