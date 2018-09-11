pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./capabilities/IVesting.sol";
//import "./PlatinPayoutProgram.sol";
import "./PlatinToken.sol";
import "./PlatinPreICO.sol";
import "./PlatinICO.sol";


/**
 * @title PlatinTGE
 * @dev Platin Token Generation Event contract. It holds token supplies, shares, rules, contracts addresses 
 * and other token economic constants and makes initial token allocation (with/without vesting). 
 * Initial token allocation function should be called outside the blockchain at the TGE moment of time, 
 * from here on out, Platin Token, preICO and ICO contracts become functional.
 */
contract PlatinTGE {
    using SafeMath for uint256;
    
    // Token decimals
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    // Total Tokens Supply
    uint256 public constant TOTAL_SUPPLY = 10000000000 * (10 ** uint256(decimals)); // 10,000,000,000 PTNX

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
    // SALES HOLDERS = PRE_ICO + ICO
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
    address public constant RESERVE = 0x378135f66fFC9F70Bb522b3c9b25ed4b8c23dE21;  // TODO change to the real one

    // AMOUNT AS A PART OF SUPPLY
    uint256 public constant PRE_ICO_AMOUNT = 103472416 * (10 ** uint256(decimals)); // 103,472,416 PTNX
    uint256 public constant ICO_AMOUNT = 2896527584 * (10 ** uint256(decimals)); // 2,896,527,584 PTNX
    uint256 public constant HOLDER02_01_AMOUNT = 1235000000 * (10 ** uint256(decimals)); // 1,235,000,000 PTNX
    uint256 public constant HOLDER02_02_AMOUNT = 665000000 * (10 ** uint256(decimals)); // 665,000,000 PTNX
    uint256 public constant HOLDER02_03_AMOUNT = 100000000 * (10 ** uint256(decimals)); // 100,000,000 PTNX
    uint256 public constant HOLDER05_01_AMOUNT = 50000000 * (10 ** uint256(decimals)); // 50,000,000 PTNX 
    uint256 public constant HOLDER05_02_AMOUNT = 25000000 * (10 ** uint256(decimals)); // 25,000,000 PTNX
    uint256 public constant HOLDER05_03_AMOUNT = 100000 * (10 ** uint256(decimals)); // 100,000 PTNX
    uint256 public constant HOLDER05_04_AMOUNT = 200000 * (10 ** uint256(decimals)); // 200,000 PTNX
    uint256 public constant HOLDER05_05_AMOUNT = 5000000 * (10 ** uint256(decimals)); // 5,000,000 PTNX
    uint256 public constant HOLDER05_06_AMOUNT = 1000000 * (10 ** uint256(decimals)); // 1,000,000 PTNX
    uint256 public constant HOLDER05_07_AMOUNT = 4167000 * (10 ** uint256(decimals)); // 4,167,000 PTNX
    uint256 public constant HOLDER05_08_AMOUNT = 500000000 * (10 ** uint256(decimals)); // 500,000,000 PTNX
    uint256 public constant HOLDER05_09_AMOUNT = 114533000 * (10 ** uint256(decimals)); // 114,533,000 PTNX 
    uint256 public constant HOLDER06_01_AMOUNT = 2200 * (10 ** uint256(decimals)); // 2200 PTNX
    uint256 public constant HOLDER06_02_AMOUNT = 299997800 * (10 ** uint256(decimals)); // 299,997,800 PTNX

    // Tokens ico lockup period
    uint256 public constant ICO_LOCKUP_PERIOD = 365 days;

    // Unsold tokens lockup period
    uint256 public constant UNSOLD_LOCKUP_PERIOD = 182 days;
    
    // Platin Token ICO rate, regular
    uint256 public constant TOKEN_RATE = 1000; 

    // Platin Token ICO rate with lockup, 20% bonus
    uint256 public constant TOKEN_RATE_LOCKUP = 1200;

    // Platin ICO min purchase amount
    uint256 public constant MIN_PURCHASE_AMOUNT = 1 ether;

    // HOLDER VESTING
    mapping (address => address) public HOLDER_VESTING; // solium-disable-line mixedcase

    // LOCKUP AUTORIZED
    mapping (address => bool) public LOCKUP_AUTHORIZED; // solium-disable-line mixedcase

    // VESTING AUTORIZED
    mapping (address => bool) public VESTING_AUTHORIZED; // solium-disable-line mixedcase    

    // Platin Token contract
    PlatinToken public token;

    // Platin preICO contract
    PlatinPreICO public preIco;

    // Platin ICO contract
    PlatinICO public ico;

    // Platin Vesting contract for the tge holders
    IVesting public holderVesting;

    // Platin Vesting contract for the unsold vesting
    IVesting public unsoldVesting;
    

    /**
     * @dev Constructor
     * @param _token address Address of the Platin Token contract       
     * @param _preIco address Address of the Platin PreICO contract  
     * @param _ico address Address of the Platin ICO contract
     * @param _holderVesting address Address of the Vesting contract to use for the token holder vesting
     * @param _unsoldVesting address Address of the Vesting contract to use for the unsold tokens vesting
     */  
    constructor(
        PlatinToken _token, 
        PlatinPreICO _preIco, 
        PlatinICO _ico,
        IVesting _holderVesting, 
        IVesting _unsoldVesting
    ) public {
        require(_token != address(0), "Token address can't be zero.");
        require(_preIco != address(0), "PreICO address can't be zero.");
        require(_ico != address(0), "ICO address can't be zero.");
        require(_holderVesting != address(0), "Holder Vesting address can't be zero.");
        require(_unsoldVesting != address(0), "Unsold Vesting address can't be zero.");

        token = _token;
        preIco = _preIco;
        ico = _ico;
        holderVesting = _holderVesting;
        unsoldVesting = _unsoldVesting;

        // Lockup Authorized
        LOCKUP_AUTHORIZED[ico] = true;

        // Vesting Authorized
        VESTING_AUTHORIZED[HOLDER02_03] = true;
        VESTING_AUTHORIZED[preIco] = true;
        VESTING_AUTHORIZED[ico] = true;

        // Holder Vesting
        HOLDER_VESTING[HOLDER02_01] = holderVesting;
        HOLDER_VESTING[HOLDER02_02] = holderVesting;  
        HOLDER_VESTING[HOLDER05_02] = holderVesting;     
        HOLDER_VESTING[HOLDER05_06] = holderVesting;
        HOLDER_VESTING[HOLDER05_07] = holderVesting; 
        HOLDER_VESTING[HOLDER05_08] = holderVesting;
    }

    /**
     * @dev Allocate function. Token Generation Event entry point.
     * It makes initial token allocation according to the token supply constants.
     */
    function allocate() public {

        // Should not be allocated already
        require(token.totalSupply() == 0, "Allocation is already done.");

        // SALES          
        token.allocate(address(preIco), PRE_ICO_AMOUNT, address(0));
        token.allocate(address(ico), ICO_AMOUNT, address(0));
      
        // SUPPLY01
        token.allocate(HOLDER01, SUPPLY01, HOLDER_VESTING[HOLDER01]);

        // SUPPLY02
        token.allocate(HOLDER02_01, HOLDER02_01_AMOUNT, HOLDER_VESTING[HOLDER02_01]);
        token.allocate(HOLDER02_02, HOLDER02_02_AMOUNT, HOLDER_VESTING[HOLDER02_02]);
        token.allocate(HOLDER02_03, HOLDER02_03_AMOUNT, HOLDER_VESTING[HOLDER02_03]);

        // SUPPLY03
        token.allocate(HOLDER03, SUPPLY03, HOLDER_VESTING[HOLDER03]);

        // SUPPLY04
        token.allocate(HOLDER04, SUPPLY04, HOLDER_VESTING[HOLDER04]);

        // SUPPLY05
        token.allocate(HOLDER05_01, HOLDER05_01_AMOUNT, HOLDER_VESTING[HOLDER05_01]);
        token.allocate(HOLDER05_02, HOLDER05_02_AMOUNT, HOLDER_VESTING[HOLDER05_02]);
        token.allocate(HOLDER05_03, HOLDER05_03_AMOUNT, HOLDER_VESTING[HOLDER05_03]);   
        token.allocate(HOLDER05_04, HOLDER05_04_AMOUNT, HOLDER_VESTING[HOLDER05_04]);  
        token.allocate(HOLDER05_05, HOLDER05_05_AMOUNT, HOLDER_VESTING[HOLDER05_05]);  
        token.allocate(HOLDER05_06, HOLDER05_06_AMOUNT, HOLDER_VESTING[HOLDER05_06]);
        token.allocate(HOLDER05_07, HOLDER05_07_AMOUNT, HOLDER_VESTING[HOLDER05_07]);         
        token.allocate(HOLDER05_08, HOLDER05_08_AMOUNT, HOLDER_VESTING[HOLDER05_08]);         
        token.allocate(HOLDER05_09, HOLDER05_09_AMOUNT, HOLDER_VESTING[HOLDER05_09]);     

        // SUPPLY06
        token.allocate(HOLDER06_01, HOLDER06_01_AMOUNT, HOLDER_VESTING[HOLDER06_01]);
        token.allocate(HOLDER06_02, HOLDER06_02_AMOUNT, HOLDER_VESTING[HOLDER06_02]); 

        // Check Token Total Supply
        require(token.totalSupply() == TOTAL_SUPPLY, "Total supply check error.");
    }
}
