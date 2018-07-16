pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PlatinVesting.sol";
import "./PlatinToken.sol";
import "./PlatinICO.sol";


/**
 * @title PlatinTGE
 */
contract PlatinTGE is Ownable {
    using SafeMath for uint256;
    
    // Token decimals
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    // SUPPLY
    // TOTAL_SUPPLY = 10,000,000,000 PTNX, is distributed as follows:
    uint256 public constant SALES_SUPPLY = 3000000000 * (10 ** uint256(decimals)); // 3,000,000,000 PTNX - 30%
    uint256 public constant SUPPLY01 = 2000000000 * (10 ** uint256(decimals)); // 2,000,000,000 PTNX - 20%
    uint256 public constant SUPPLY02 = 2000000000 * (10 ** uint256(decimals)); // 2,000,000,000 PTNX - 20%
    uint256 public constant SUPPLY03 = 1000000000 * (10 ** uint256(decimals)); // 1,000,000,000 PTNX - 10%
    uint256 public constant SUPPLY04 = 1000000000 * (10 ** uint256(decimals)); // 1,000,000,000 PTNX - 10%
    uint256 public constant SUPPLY05 = 700000000 * (10 ** uint256(decimals)); // 700,000,000 PTNX - 7%
    uint256 public constant SUPPLY06 = 300000000 * (10 ** uint256(decimals)); // 300,000,000 PTNX - 3%

    // HOLDERS
    // SALES = PRE_ICO (current contract) + ICO (ico contract), unsold amount will be sent to the UNSOLD_ICO_RESERVE
    address public constant HOLDER01 = 0x378135f66fFC9F70Bb522b3c9b25ed4b8c23dE50;
    address public constant HOLDER02_01 = 0xe74f74f5Ac3988108FC5a0015277Ff13E130CfAF;
    address public constant HOLDER02_02 = 0x5ffc1543EA4Dd01d10FB3435502735f7d68d4547;
    address public constant HOLDER02_03 = 0x588eFc28322Df49f44D0fbF9A436F20ac9b521a3;
    address public constant HOLDER03 = 0x4575479B1dF9305c0594542Dc66cdAD37932177F;
    address public constant HOLDER04 = 0x4fFcaee0380Da173538A333d01E7718c533b935f;
    address public constant HOLDER05_01 = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO change to the real one 
    address public constant HOLDER05_02 = 0xe446Af5D384B3151C14932030318a01dde34Cce9;
    address public constant HOLDER05_03 = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO change to the real one
    address public constant HOLDER05_04 = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO change to the real one
    address public constant HOLDER05_05 = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO change to the real one
    address public constant HOLDER05_06 = 0x3Eb6024C93f961Cf251c9c94749A868DdCc8Cb64;
    address public constant HOLDER05_07 = 0x0E135b99e6012C1A0e1BC1c8CAb7921499f84Ba9;
    address public constant HOLDER05_08 = 0xd9cE7d631EE19546348a4447882eFCee816eCE01;
    address public constant HOLDER05_09 = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO change to the real one
    address public constant HOLDER06_01 = 0xca6aDDEDc6264c48bDd059E04C351f7abc3f667B;
    address public constant HOLDER06_02 = 0xE375e16FFbc36216F2708D668eBa131E64A4aC81;  

    // AMOUNTS AS PART OF SUPPLY
    uint256 public constant PRE_ICO_AMOUNT = 103472416 * (10 ** uint256(decimals)); // 103,472,416 PTNX
    uint256 public constant ICO_AMOUNT = 2896527584 * (10 ** uint256(decimals)); // 2,896,527,584 PTNX
    uint256 public constant HOLDER02_01_AMOUNT = 1235000000 * (10 ** uint256(decimals)); // 1,235,000,000 PTNX
    uint256 public constant HOLDER02_02_AMOUNT = 665000000 * (10 ** uint256(decimals)); // 665,000,000 PTNX
    uint256 public constant HOLDER02_03_AMOUNT =  100000000 * (10 ** uint256(decimals)); // 100,000,000 PTNX
    uint256 public constant HOLDER05_01_AMOUNT = 50000000 * (10 ** uint256(decimals)); // 50,000,000 PTNX 
    uint256 public constant HOLDER05_02_AMOUNT = 25000000 * (10 ** uint256(decimals)); // 25,000,000 PTNX
    uint256 public constant HOLDER05_03_AMOUNT = 100000 * (10 ** uint256(decimals)); // 100,000 PTNX
    uint256 public constant HOLDER05_04_AMOUNT = 200000 * (10 ** uint256(decimals)); // 200,000 PTNX
    uint256 public constant HOLDER05_05_AMOUNT = 5000000 * (10 ** uint256(decimals)); // 5,000,000 PTNX
    uint256 public constant HOLDER05_06_AMOUNT = 1000000 * (10 ** uint256(decimals)); // 1,000,000 PTNX
    uint256 public constant HOLDER05_07_AMOUNT = 4167000 * (10 ** uint256(decimals)); // 4,167,000 PTNX
    uint256 public constant HOLDER05_08_AMOUNT = 500000000 * (10 ** uint256(decimals)); // 500,000,000 PTNX;
    uint256 public constant HOLDER05_09_AMOUNT = 114533000 * (10 ** uint256(decimals)); // 114,533,000 PTNX;    
    uint256 public constant HOLDER06_01_AMOUNT = 2200 * (10 ** uint256(decimals)); // 2200 PTNX
    uint256 public constant HOLDER06_02_AMOUNT = 299997800 * (10 ** uint256(decimals)); // 299,997,800 PTNX

    // unsold ICO reserve
    address public constant UNSOLD_ICO_RESERVE = 0xef34779Ad86Cd818E86e0ec1096186D35377c474;

    // tokens locked up release date
    uint256 public constant LOCKUP_RELEASE_DATE = 1533124800; // TODO change to the real one    

    // Platin Token ICO rate, regular
    uint256 public constant TOKEN_RATE = 1000; 

    // Platin Token ICO rate, with lockup, 20% bonus
    uint256 public constant TOKEN_RATE_LOCKUP = 1200;

    // Platin ICO min purchase amount
    uint256 public constant MIN_PURCHASE_AMOUNT = 1 ether;

    // Error messages
    string public constant ALLOCATION_ERROR = "Token allocation error";
    string public constant SUPPLY_CHECK_ERROR = "Supply check error";
    string public constant TOTAL_SUPPLY_CHECK_ERROR = "Total supply check error";

    // HOLDER VESTING
    mapping (address => address) public HOLDER_VESTING; // solium-disable-line mixedcase

    // Platin Token contract
    PlatinToken public token;

    // Platin ICO contract
    PlatinICO public ico;

    // Platin Standard Vesting contract
    PlatinVesting public vesting;

    // PreICO distributed
    uint256 preIcoDistributed;


    /**
     * @dev Constructor
     */  
    constructor(PlatinToken _token, PlatinICO _ico, PlatinVesting _vesting) public {
        require(_token != address(0), ""); // TODO: provide an error msg
        require(_ico != address(0), ""); // TODO: provide an error msg
        require(_vesting != address(0), ""); // TODO: provide an error msg

        token = _token;
        ico = _ico;
        vesting = _vesting;

        // Holders Vesting
        HOLDER_VESTING[HOLDER05_07] = vesting;
    }

    // TGE, allocate Tokens
    function allocate() public {
        uint256 _supplyCheck;

        // SALES          
        require(token.allocate(address(this), PRE_ICO_AMOUNT, address(0)), ALLOCATION_ERROR);
        _supplyCheck = PRE_ICO_AMOUNT;
        require(token.allocate(address(ico), ICO_AMOUNT, address(0)), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(ICO_AMOUNT);
        require(_supplyCheck == SALES_SUPPLY, SUPPLY_CHECK_ERROR);
        _supplyCheck = 0;           

        // SUPPLY01
        require(token.allocate(HOLDER01, SUPPLY01, HOLDER_VESTING[HOLDER01]), ALLOCATION_ERROR);

        // SUPPLY02
        require(token.allocate(HOLDER02_01, HOLDER02_01_AMOUNT, HOLDER_VESTING[HOLDER02_01]), ALLOCATION_ERROR);
        _supplyCheck = HOLDER02_01_AMOUNT;
        require(token.allocate(HOLDER02_02, HOLDER02_02_AMOUNT, HOLDER_VESTING[HOLDER02_02]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER02_02_AMOUNT);
        require(token.allocate(HOLDER02_03, HOLDER02_03_AMOUNT, HOLDER_VESTING[HOLDER02_03]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER02_03_AMOUNT);
        require(_supplyCheck == SUPPLY02, SUPPLY_CHECK_ERROR);
        _supplyCheck = 0;        

        // SUPPLY03
        require(token.allocate(HOLDER03, SUPPLY03, HOLDER_VESTING[HOLDER03]), ALLOCATION_ERROR);

        // SUPPLY04
        require(token.allocate(HOLDER04, SUPPLY04, HOLDER_VESTING[HOLDER04]), ALLOCATION_ERROR);

        // SUPPLY05
        require(token.allocate(HOLDER05_01, HOLDER05_01_AMOUNT, HOLDER_VESTING[HOLDER05_01]), ALLOCATION_ERROR);
        _supplyCheck = HOLDER05_01_AMOUNT;
        require(token.allocate(HOLDER05_02, HOLDER05_02_AMOUNT, HOLDER_VESTING[HOLDER05_02]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_02_AMOUNT);
        require(token.allocate(HOLDER05_03, HOLDER05_03_AMOUNT, HOLDER_VESTING[HOLDER05_03]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_03_AMOUNT);     
        require(token.allocate(HOLDER05_04, HOLDER05_04_AMOUNT, HOLDER_VESTING[HOLDER05_04]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_04_AMOUNT);   
        require(token.allocate(HOLDER05_05, HOLDER05_05_AMOUNT, HOLDER_VESTING[HOLDER05_05]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_05_AMOUNT);    
        require(token.allocate(HOLDER05_06, HOLDER05_06_AMOUNT, HOLDER_VESTING[HOLDER05_06]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_06_AMOUNT);  
        require(token.allocate(HOLDER05_07, HOLDER05_07_AMOUNT, HOLDER_VESTING[HOLDER05_07]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_07_AMOUNT);             
        require(token.allocate(HOLDER05_08, HOLDER05_08_AMOUNT, HOLDER_VESTING[HOLDER05_08]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_08_AMOUNT);             
        require(token.allocate(HOLDER05_09, HOLDER05_09_AMOUNT, HOLDER_VESTING[HOLDER05_09]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER05_09_AMOUNT);                                                           
        require(_supplyCheck == SUPPLY05, SUPPLY_CHECK_ERROR);
        _supplyCheck = 0;       

        // SUPPLY06
        require(token.allocate(HOLDER06_01, HOLDER06_01_AMOUNT, HOLDER_VESTING[HOLDER06_01]), ALLOCATION_ERROR);
        _supplyCheck = HOLDER06_01_AMOUNT;
        require(token.allocate(HOLDER06_02, HOLDER06_02_AMOUNT, HOLDER_VESTING[HOLDER06_02]), ALLOCATION_ERROR);
        _supplyCheck = _supplyCheck.add(HOLDER06_02_AMOUNT);     
        require(_supplyCheck == SUPPLY06, SUPPLY_CHECK_ERROR);
        _supplyCheck = 0;          

        // Check Token Total Supply
        require(token.totalSupply() == token.TOTAL_SUPPLY(), TOTAL_SUPPLY_CHECK_ERROR);
    }

    // TGE, preICO sale 
    function preICOSale(address _beneficiary, uint256 _amount, address _vesting) public onlyOwner {
        require(token.balanceOf(_beneficiary) == 0, ""); // TODO: provide an error msg
        require(preIcoDistributed.add(_amount) <= PRE_ICO_AMOUNT, "");  // TODO: provide an error msg
        require(token.transferWithVesting(_beneficiary, _amount, _vesting), ""); // TODO: provide an error msg  
        preIcoDistributed = preIcoDistributed.add(_amount);
    }

    // TGE, many preICO sales. Not overloaded due to limitations with truffle testing.
    function manyPreICOSales(address[] _beneficiaries, uint256[] _amounts, address[] _vestings) public onlyOwner {
        require(_beneficiaries.length == _amounts.length, ""); // TODO: provide an error msg
        require(_beneficiaries.length == _vestings.length, ""); // TODO: provide an error msg

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            address _beneficiary = _beneficiaries[i];
            uint256 _amount = _amounts[i];
            address _vesting = _vestings[i];

            require(token.balanceOf(_beneficiary) == 0, ""); // TODO: provide an error msg
            require(preIcoDistributed.add(_amount) <= PRE_ICO_AMOUNT, "");  // TODO: provide an error msg
            require(token.transferWithVesting(_beneficiary, _amount, _vesting), ""); // TODO: provide an error msg
            preIcoDistributed = preIcoDistributed.add(_amount);
        }     
    }
}
