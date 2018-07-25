pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinPreICO
 * @dev PreICO contract that distributes tokens sold during the private preICO stage.
 * Appropriate distribute* functions should be called outside the blockchain to 
 * distribute the preIco amount to the preIco token holders.
 */
contract PlatinPreICO is HasNoEther {
    using SafeMath for uint256;

    // Platin Token contract
    PlatinToken public token;

    // Platin TGE contract
    PlatinTGE public tge;    

    // PreICO distributed amount
    uint256 public preIcoDistributed;

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
     * @dev Set TGE contract
     * @param _tge address PlatinTGE contract address    
     */
    function setTGE(PlatinTGE _tge) external onlyOwner {
        require(tge == address(0), "TGE is already set.");
        require(_tge != address(0), "TGE address can't be zero.");
        tge = _tge;
    }    

    /**
     * @dev Distribute many preICO sale token amounts, every single amount could be vested
     * @param _beneficiaries address[] List of addresses who get the tokens
     * @param _amounts uint256[] Amounts of the distribution
     * @param _vestings address[] List of vesting contracts for the distribution (could be zero address to omit vesting)
     */
    function distributeManyPreICOSales(address[] _beneficiaries, uint256[] _amounts, address[] _vestings) external onlyOwner {
        require(_beneficiaries.length == _amounts.length, "Beneficiaries and amounts lists should have the same length.");
        require(_beneficiaries.length == _vestings.length, "Beneficiaries and vestings lists should have the same length.");

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            distributePreICOSale(_beneficiaries[i], _amounts[i], _vestings[i]);
        }     
    }    
    
    /**
     * @dev Distribute preICO sale token amount, amount could be vested
     * @param _beneficiary address Address who gets the tokens
     * @param _amount uint256 Amount of the distribution
     * @param _vesting address Vesting contract for the distribution (could be zero address to omit vesting)
     */
    function distributePreICOSale(address _beneficiary, uint256 _amount, address _vesting) public onlyOwner {
        require(token.balanceOf(_beneficiary) == 0, "PreIco tokens are already distributed to the current beneficiary.");
        require(preIcoDistributed.add(_amount) <= tge.PRE_ICO_AMOUNT(), "Can't distribute more than preIco amount.");
        require(token.transferWithVesting(_beneficiary, _amount, _vesting), "TranferWithVesting is failed during preIco distribution.");  

        emit Distribute(_beneficiary, _amount);
        preIcoDistributed = preIcoDistributed.add(_amount);
    }
}
