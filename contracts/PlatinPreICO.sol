pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinPreICO
 */
contract PlatinPreICO is Ownable {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;

    // Platin TGE contract
    PlatinTGE public tge;

    // PreICO distributed
    uint256 public preIcoDistributed;

    // distribute event logging
    event Distribute(address indexed to, uint256 amount);


    /**
     * @dev Constructor
     */  
    constructor(PlatinToken _token) public {
        require(_token != address(0), ""); // TODO: provide an error msg
        token = _token;       
    }

    // set TGE contract
    function setTGE(PlatinTGE _tge) public onlyOwner {
        require(tge == address(0), ""); // TODO: provide an error msg
        require(_tge != address(0), ""); // TODO: provide an error msg
        tge = _tge;
    }

    // distribute preICO sale 
    function distributePreICOSale(address _beneficiary, uint256 _amount, address _vesting) public onlyOwner {
        require(token.balanceOf(_beneficiary) == 0, ""); // TODO: provide an error msg
        require(preIcoDistributed.add(_amount) <= tge.PRE_ICO_AMOUNT(), "");  // TODO: provide an error msg
        require(token.transferWithVesting(_beneficiary, _amount, _vesting), ""); // TODO: provide an error msg  

        emit Distribute(_beneficiary, _amount);
        preIcoDistributed = preIcoDistributed.add(_amount);
    }

    // distribute many preICO sales.
    function distributeManyPreICOSales(address[] _beneficiaries, uint256[] _amounts, address[] _vestings) public onlyOwner {
        require(_beneficiaries.length == _amounts.length, ""); // TODO: provide an error msg
        require(_beneficiaries.length == _vestings.length, ""); // TODO: provide an error msg

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            distributePreICOSale(_beneficiaries[i], _amounts[i], _vestings[i]);
        }     
    }
}
