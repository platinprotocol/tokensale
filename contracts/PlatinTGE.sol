pragma solidity ^0.4.25; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinToken.sol";


/**
 * @title PlatinTGE
 * @dev Platin Token Generation Event contract. It holds token economic constants and makes initial token allocation.
 * Initial token allocation function should be called outside the blockchain at the TGE moment of time, 
 * from here on out, Platin Token and other Platin contracts become functional.
 */
contract PlatinTGE {
    using SafeMath for uint256;
    
    // Token decimals
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    // Total Tokens Supply
    uint256 public constant TOTAL_SUPPLY = 1000000000 * (10 ** uint256(decimals)); // 1,000,000,000 PTNX

    // SUPPLY
    // TOTAL_SUPPLY = 1,000,000,000 PTNX, is distributed as follows:
    uint256 public constant SALES_SUPPLY = 300000000 * (10 ** uint256(decimals)); // 300,000,000 PTNX - 30%
    uint256 public constant MINING_POOL_SUPPLY = 200000000 * (10 ** uint256(decimals)); // 200,000,000 PTNX - 20%
    uint256 public constant FOUNDERS_AND_EMPLOYEES_SUPPLY = 200000000 * (10 ** uint256(decimals)); // 200,000,000 PTNX - 20%
    uint256 public constant AIRDROPS_POOL_SUPPLY = 100000000 * (10 ** uint256(decimals)); // 100,000,000 PTNX - 10%
    uint256 public constant RESERVES_POOL_SUPPLY = 100000000 * (10 ** uint256(decimals)); // 100,000,000 PTNX - 10%
    uint256 public constant ADVISORS_POOL_SUPPLY = 70000000 * (10 ** uint256(decimals)); // 70,000,000 PTNX - 7%
    uint256 public constant ECOSYSTEM_POOL_SUPPLY = 30000000 * (10 ** uint256(decimals)); // 30,000,000 PTNX - 3%

    // HOLDERS
    address public PRE_ICO_POOL; // solium-disable-line mixedcase 
    address public ICO; // solium-disable-line mixedcase
    address public MINING_POOL; // solium-disable-line mixedcase 
    address public FOUNDERS_POOL; // solium-disable-line mixedcase
    address public EMPLOYEES_POOL; // solium-disable-line mixedcase 
    address public AIRDROPS_POOL; // solium-disable-line mixedcase 
    address public RESERVES_POOL; // solium-disable-line mixedcase 
    address public ADVISORS_POOL; // solium-disable-line mixedcase
    address public ECOSYSTEM_POOL; // solium-disable-line mixedcase 

    // HOLDER AMOUNT AS PART OF SUPPLY
    // SALES_SUPPLY = PRE_ICO_POOL_AMOUNT + ICO_AMOUNT
    uint256 public constant PRE_ICO_POOL_AMOUNT = 20000000 * (10 ** uint256(decimals)); // 20,000,000 PTNX
    uint256 public constant ICO_AMOUNT = 280000000 * (10 ** uint256(decimals)); // 280,000,000 PTNX
    // FOUNDERS_AND_EMPLOYEES_SUPPLY = FOUNDERS_POOL_AMOUNT + EMPLOYEES_POOL_AMOUNT
    uint256 public constant FOUNDERS_POOL_AMOUNT = 190000000 * (10 ** uint256(decimals)); // 190,000,000 PTNX
    uint256 public constant EMPLOYEES_POOL_AMOUNT = 10000000 * (10 ** uint256(decimals)); // 10,000,000 PTNX

    // Unsold tokens reserve address
    address public UNSOLD_RESERVE; // solium-disable-line mixedcase

    // Tokens ico sale with lockup period
    uint256 public constant ICO_LOCKUP_PERIOD = 182 days;
    
    // Platin Token ICO rate, regular
    uint256 public constant TOKEN_RATE = 1000; 

    // Platin Token ICO rate with lockup, 20% bonus
    uint256 public constant TOKEN_RATE_LOCKUP = 1200;

    // Platin ICO min purchase amount
    uint256 public constant MIN_PURCHASE_AMOUNT = 1 ether;

    // Platin Token contract
    PlatinToken public token;

    // TGE time
    uint256 public tgeTime;


    /**
     * @dev Constructor
     * @param _tgeTime uint256 TGE moment of time
     * @param _token address Address of the Platin Token contract       
     * @param _preIcoPool address Address of the Platin PreICO Pool  
     * @param _ico address Address of the Platin ICO contract
     * @param _miningPool address Address of the Platin Mining Pool
     * @param _foundersPool address Address of the Platin Founders Pool
     * @param _employeesPool address Address of the Platin Employees Pool
     * @param _airdropsPool address Address of the Platin Airdrops Pool
     * @param _reservesPool address Address of the Platin Reserves Pool
     * @param _advisorsPool address Address of the Platin Advisors Pool
     * @param _ecosystemPool address Address of the Platin Ecosystem Pool  
     * @param _unsoldReserve address Address of the Platin Unsold Reserve                                 
     */  
    constructor(
        uint256 _tgeTime,
        PlatinToken _token, 
        address _preIcoPool, 
        address _ico,
        address _miningPool,
        address _foundersPool,
        address _employeesPool,
        address _airdropsPool,
        address _reservesPool,
        address _advisorsPool,
        address _ecosystemPool,
        address _unsoldReserve
    ) public {
        require(_tgeTime >= block.timestamp, "TGE time should be >= current time."); // solium-disable-line security/no-block-members
        require(_token != address(0), "Token address can't be zero.");
        require(_preIcoPool != address(0), "PreICO Pool address can't be zero.");
        require(_ico != address(0), "ICO address can't be zero.");
        require(_miningPool != address(0), "Mining Pool address can't be zero.");
        require(_foundersPool != address(0), "Founders Pool address can't be zero.");
        require(_employeesPool != address(0), "Employees Pool address can't be zero.");
        require(_airdropsPool != address(0), "Airdrops Pool address can't be zero.");
        require(_reservesPool != address(0), "Reserves Pool address can't be zero.");
        require(_advisorsPool != address(0), "Advisors Pool address can't be zero.");
        require(_ecosystemPool != address(0), "Ecosystem Pool address can't be zero.");
        require(_unsoldReserve != address(0), "Unsold reserve address can't be zero.");

        // Setup tge time
        tgeTime = _tgeTime;

        // Setup token address
        token = _token;

        // Setup holder addresses
        PRE_ICO_POOL = _preIcoPool;
        ICO = _ico;
        MINING_POOL = _miningPool;
        FOUNDERS_POOL = _foundersPool;
        EMPLOYEES_POOL = _employeesPool;
        AIRDROPS_POOL = _airdropsPool;
        RESERVES_POOL = _reservesPool;
        ADVISORS_POOL = _advisorsPool;
        ECOSYSTEM_POOL = _ecosystemPool;

        // Setup unsold reserve address
        UNSOLD_RESERVE = _unsoldReserve; 
    }

    /**
     * @dev Allocate function. Token Generation Event entry point.
     * It makes initial token allocation according to the initial token supply constants.
     */
    function allocate() public {

        // Should be called just after tge time
        require(block.timestamp >= tgeTime, "Should be called just after tge time."); // solium-disable-line security/no-block-members

        // Should not be allocated already
        require(token.totalSupply() == 0, "Allocation is already done.");

        // SALES          
        token.allocate(PRE_ICO_POOL, PRE_ICO_POOL_AMOUNT);
        token.allocate(ICO, ICO_AMOUNT);
      
        // MINING POOL
        token.allocate(MINING_POOL, MINING_POOL_SUPPLY);

        // FOUNDERS AND EMPLOYEES
        token.allocate(FOUNDERS_POOL, FOUNDERS_POOL_AMOUNT);
        token.allocate(EMPLOYEES_POOL, EMPLOYEES_POOL_AMOUNT);

        // AIRDROPS POOL
        token.allocate(AIRDROPS_POOL, AIRDROPS_POOL_SUPPLY);

        // RESERVES POOL
        token.allocate(RESERVES_POOL, RESERVES_POOL_SUPPLY);

        // ADVISORS POOL
        token.allocate(ADVISORS_POOL, ADVISORS_POOL_SUPPLY);

        // ECOSYSTEM POOL
        token.allocate(ECOSYSTEM_POOL, ECOSYSTEM_POOL_SUPPLY);

        // Check Token Total Supply
        require(token.totalSupply() == TOTAL_SUPPLY, "Total supply check error.");   
    }
}
