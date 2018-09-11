pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


// TODO: editable

/**
 * @title PlatinPool
 * @dev 
 */
contract PlatinPool is HasNoEther {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;  

    // Distributed amount
    uint256 public distributed;

    // distribution struct
    struct Distribution {
        uint256 amount; // amount of distribution
        uint256[] lockups; // amount lockups
        bool refundable; // is lockuped amount refundable        
        bool distributed; // is amount already distributed
    }

    // distribution mapping
    mapping (address => Distribution) public distribution;

    // distribute event logging
    event Distribute(address indexed to, uint256 amount);

    // distribute event logging
    event AddDistribution(address indexed beneficiary, uint256 amount, uint256[] lockups);

    /**
     * @dev Constructor
     * @param _token address PlatinToken contract address  
     */
    constructor(PlatinToken _token) public {
        require(_token != address(0), "Token address can't be zero.");
        token = _token;       
    }


    /**
     * @dev Add a distribution record
     * @param _beneficiary address Address who gets the tokens
     * @param _amount uint256 Amount of the distribution
     * @param _lockups uint256[] Lockups list
     * @param _refundable bool Is lockuped amount refundable
     */
    function addDistribution(address _beneficiary, uint256 _amount, uint256[] _lockups, bool _refundable) public onlyOwner {
        require(distribution[_beneficiary].amount == 0, "Beneficiary already listed.");
        
        distribution[_beneficiary].amount = _amount;
        distribution[_beneficiary].lockups = _lockups;
        distribution[_beneficiary].refundable = _refundable;
        distribution[_beneficiary].distributed = false;

        emit AddDistribution(_beneficiary, _amount, _lockups);
    }    

    /**
     * @dev Distribute amount to the beneficiary
     */
    function distribute(address _beneficiary) public {
        require(distribution[_beneficiary].amount > 0, "");
        require(!distribution[_beneficiary].distributed, "");

        uint256 _amount = distribution[_beneficiary].amount;
        uint256[] storage _lockups = distribution[_beneficiary].lockups;
        bool _refundable = distribution[_beneficiary].refundable;

        token.transferWithLockup(_beneficiary, _amount, _lockups, _refundable);

        emit Distribute(_beneficiary, _amount);  
        distributed = distributed.add(_amount);
        distribution[_beneficiary].distributed = true;
    }

    /**
     * @dev Refund refundable lockedup amount
     * @param _from address The address which you want to refund tokens from
     */
    function refundLockedUp(
        address _from
    )
    public onlyOwner returns (bool) {
        return token.refundLockedUp(_from);
    }     
}
