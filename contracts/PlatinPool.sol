pragma solidity ^0.4.25; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

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
 * Adding of distribution records is limited to the pool balance, or, if there no balance yet, initial supply.
 * When pool gets its first balance initial supply will be reset.
 */
contract PlatinPool is HasNoEther, Authorizable {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;  

    // initial supply
    uint256 public initial;

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
     * @param _initial uint256 Initial distribution 
     */
    constructor(PlatinToken _token, uint256 _initial) public {
        require(_token != address(0), "Token address can't be zero.");
        token = _token;    
        initial = _initial;   
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

        uint256 _distributable = 0;
        uint256 _balance = token.balanceOf(address(this));

        if (_balance > 0) {
            initial = 0;
        }    

        if (initial > 0) {
            _distributable = initial.sub(allocated);
        } else {
            _distributable = _balance.sub(allocated);
        }

        require(_amount <= _distributable, "Amount isn't distributible.");        
        
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

        // reset initial in case of successful transfer of tokens
        initial = 0;

        distributed = distributed.add(_amount);
        distribution[_beneficiary].distributed = true;

        emit Distribute(_beneficiary, _amount);  
    }

    /**
     * @dev Refund refundable locked up amount
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
}
