pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Authorizable.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinPool
 * @dev Pool contract holds a pool distribution table and provide pool distribution logic. 
 * Distribution itself is a public function.
 * Distribution can have lockups, lockups can be refundable.
 */
contract PlatinPool is HasNoEther, Authorizable {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;  

    // allocated to distribution
    uint256 public allocated;

    // distributed amount
    uint256 public distributed;

    // distribution struct (record)
    struct Distribution {
        uint256 amount; // amount of distribution
        uint256[] lockups; // amount lockups in a form [releaseDate1, releaseAmount1, releaseDate2, releaseAmount2, ...]
        uint256 refunded; // refunded from distribution (if applicable and happened)       
        bool refundable; // is locked up amounts refundable        
        bool distributed; // is amount already distributed
    }

    // distribution mapping (table)
    mapping (address => Distribution) public distribution;

    // distribution list (members of the pool)
    address[] public members;

    // add distribution record event logging
    event AddDistribution(address indexed beneficiary, uint256 amount, uint256[] lockups, bool refundable);

    // distribute event logging
    event Distribute(address indexed to, uint256 amount);


    /**
     * @dev Constructor
     * @param _token address PlatinToken contract address  
     */
    constructor(PlatinToken _token) public {
        require(_token != address(0), "Token address can't be zero.");
        token = _token;       
    }

    /**
     * @dev Add distribution record
     * @param _beneficiary address Address who gets the tokens
     * @param _amount uint256 Amount of the distribution
     * @param _lockups uint256[] Lockups list
     * @param _refundable bool Is lockuped amount refundable
     */
    function addDistribution(
        address _beneficiary, 
        uint256 _amount, 
        uint256[] _lockups, 
        bool _refundable
    ) 
    public onlyAuthorized
    {
        require(_beneficiary != address(0), "Beneficiary address can't be zero.");      
        require(_amount > 0, "Amount can't be zero.");            
        require(distribution[_beneficiary].amount == 0, "Beneficiary is already listed.");
        
        uint256 _amountLokedUp = 0;
        uint256 _lockupsLength = _lockups.length;
        for (uint256 i = 1; i < _lockupsLength; i = i + 2) {
            _amountLokedUp = _amountLokedUp.add(_lockups[i]);
        }

        require(_amountLokedUp <= _amount, "Can't lockup more than amount of distribution.");

        distribution[_beneficiary].amount = _amount;
        distribution[_beneficiary].lockups = _lockups;
        distribution[_beneficiary].refundable = _refundable;
        distribution[_beneficiary].distributed = false;

        allocated = allocated.add(_amount);
        members.push(_beneficiary);

        emit AddDistribution(
            _beneficiary, 
            _amount, 
            _lockups, 
            _refundable);
    }    

    /**
     * @dev Distribute amount to the beneficiary
     * @param _beneficiary address Address who gets the tokens     
     */
    function distribute(address _beneficiary) public {
        require(distribution[_beneficiary].amount > 0, "Can't find distribution record for the beneficiary.");
        require(!distribution[_beneficiary].distributed, "Already distributed.");

        uint256 _amount = distribution[_beneficiary].amount;
        uint256[] storage _lockups = distribution[_beneficiary].lockups;
        bool _refundable = distribution[_beneficiary].refundable;

        token.transferWithLockup(
            _beneficiary, 
            _amount, 
            _lockups, 
            _refundable);

        distributed = distributed.add(_amount);
        distribution[_beneficiary].distributed = true;

        emit Distribute(_beneficiary, _amount);  
    }

    /**
     * @dev Get members count
     * @return uint256 Members count
     */   
    function membersCount() public view returns (uint256) {
        return members.length;
    }

    /**
     * @dev Get list of lockups from the distribution record
     * @param _beneficiary address Address who has a distribution record    
     * @return uint256 Members count
     */   
    function getLockups(address _beneficiary) public view returns (uint256[]) {
        return distribution[_beneficiary].lockups;
    }    

    /**
     * @dev Refund refundable lockedup amount
     * @param _from address The address which you want to refund tokens from
     */
    function refundLockedUp(
        address _from
    )
    public onlyAuthorized returns (uint256) 
    {
        uint256 _refunded = token.refundLockedUp(_from);
        allocated = allocated.sub(_refunded);
        distributed = distributed.sub(_refunded);        
        distribution[_from].refunded = _refunded;
    }     
}
