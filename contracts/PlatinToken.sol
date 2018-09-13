pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "openzeppelin-solidity/contracts/ownership/NoOwner.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Authorizable.sol";
import "./HoldersToken.sol";
import "./PlatinTGE.sol";


/**
 * @title PlatinToken
 * @dev Platin PTNX Token contract. Tokens are allocated during TGE.
 * Token contract is a standard ERC20 token with additional capabilities: TGE allocation, holders tracking and lockup.
 * Initial allocation should be invoked by the TGE contract at the TGE moment of time.
 * Token contract holds list of token holders, the list includes holders with positive balance only.
 * Authorized holders can transfer token with lockup(s). Lockups can be refundable. 
 * Lockups is a list of releases dates and releases amounts in a form [releaseDate1, releaseAmount1, releaseDate2, releaseAmount2, ...])
 * In case of refund previous holder can get back locked up tokens. Only still locked up amounts can be transfered back.
 */
contract PlatinToken is HoldersToken, NoOwner, Authorizable, Pausable {
    using SafeMath for uint256;

    string public constant name = "Platin Token"; // solium-disable-line uppercase
    string public constant symbol = "PTNX"; // solium-disable-line uppercase
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    // list of lockups, in a form (owner => [releaseDate1, releaseAmount1, releaseDate2, releaseAmount2, ...])
    mapping (address => uint256[]) public lockups;

    // list of lockups that can be refunded, in a form (owner => (sender => [releaseDate1, releaseAmount1, releaseDate2, releaseAmount2, ...]))
    mapping (address => mapping (address => uint256[])) public refundable;

    // Platin TGE contract
    PlatinTGE public tge;

    // allocation event logging
    event Allocate(address indexed to, uint256 amount);

    // lockup event logging
    event Lockup(address indexed to, uint256 amount, uint256[] lockups);

    // refund event logging
    event Refund(address indexed from, address indexed to, uint256 amount);

    // spotTransfer modifier, check balance spot on transfer
    modifier spotTransfer(address _from, uint256 _value) {
        require(_value <= balanceSpot(_from), "Attempt to transfer more than balance spot.");
        _;
    }

    // onlyTGE modifier, restrict to the TGE contract only
    modifier onlyTGE() {
        require(msg.sender == address(tge), "Only TGE method.");
        _;
    }

    /**
     * @dev Set TGE contract
     * @param _tge address PlatinTGE contract address    
     */
    function setTGE(PlatinTGE _tge) external onlyOwner {
        require(tge == address(0), "TGE is already set.");
        require(_tge != address(0), "TGE address can't be zero.");
        tge = _tge;
        authorize(_tge);
    }        

    /**
     * @dev Allocate tokens during TGE
     * @param _to address Address gets the tokens
     * @param _amount uint256 Amount to allocate
     */ 
    function allocate(address _to, uint256 _amount) external onlyTGE {
        require(_to != address(0), "Allocate To address can't be zero");
        require(_amount > 0, "Allocate amount should be > 0.");
       
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        _addHolder(_to);

        require(totalSupply_ <= tge.TOTAL_SUPPLY(), "Can't allocate more than TOTAL SUPPLY.");

        emit Allocate(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }  

    /**
     * @dev Get the lockups list count
     * @param _who address Address owns lockedup list
     * @return uint256 Lockups list count     
     */
    function lockupsCount(address _who) public view returns (uint256) {
        return lockups[_who].length;
    }

    /**
     * @dev Find out if the address has lockups
     * @param _who address Address checked for lockups
     * @return bool Returns true if address has lockups  
     */    
    function hasLockups(address _who) public view returns (bool) {
        return lockups[_who].length > 0;
    }    

    /**
     * @dev Get balance locked up to the current moment of time
     * @param _who address Address owns lockedup amounts
     * @return uint256 Balance locked up to the current moment of time     
     */       
    function balanceLockedUp(address _who) public view returns (uint256) {
        uint256 _balanceLokedUp = 0;
        uint256 _lockupsLength = lockups[_who].length;
        for (uint256 i = 0; i < _lockupsLength; i = i + 2) {
            if (lockups[_who][i] > block.timestamp) // solium-disable-line security/no-block-members
                _balanceLokedUp = _balanceLokedUp.add(lockups[_who][i + 1]);
        }
        return _balanceLokedUp;
    }

    /**
     * @dev Get balance spot for the current moment of time
     * @param _who address Address owns balance spot
     * @return uint256 Balance spot for the current moment of time     
     */   
    function balanceSpot(address _who) public view returns (uint256) {
        uint256 _balanceSpot = balanceOf(_who);
        _balanceSpot = _balanceSpot.sub(balanceLockedUp(_who));      
        return _balanceSpot;
    }         

    /**
     * @dev Transfer tokens from one address to another
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @return bool Returns true if the transfer was succeeded
     */
    function transfer(address _to, uint256 _value) public whenNotPaused spotTransfer(msg.sender, _value) returns (bool) {
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @return bool Returns true if the transfer was succeeded
     */
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused spotTransfer(_from, _value) returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Transfer tokens from one address to another with lockup
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @param _lockups uint256[] List of lockups
     * @param _refundable bool Is locked up amount refundable
     * @return bool Returns true if the transfer was succeeded     
     */
    function transferWithLockup(
        address _to, 
        uint256 _value, 
        uint256[] _lockups,
        bool _refundable
    ) 
    public onlyAuthorized returns (bool)
    {        
        transfer(_to, _value);
        _lockup(_to, _value, _lockups, _refundable); // solium-disable-line arg-overflow     
    }       

    /**
     * @dev Transfer tokens from one address to another with lockup
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 The amount of tokens to be transferred
     * @param _lockups uint256[] List of lockups      
     * @param _refundable bool Is locked up amount refundable      
     * @return bool Returns true if the transfer was succeeded     
     */
    function transferFromWithLockup(
        address _from, 
        address _to, 
        uint256 _value, 
        uint256[] _lockups,
        bool _refundable
    ) 
    public onlyAuthorized returns (bool)
    {
        transferFrom(_from, _to, _value);
        _lockup(_to, _value, _lockups, _refundable); // solium-disable-line arg-overflow  
    }     

    /**
     * @dev Refund refundable lockedup amount
     * @param _from address The address which you want to refund tokens from
     * @return uint256 Returns amount of refunded tokens   
     */
    function refundLockedUp(
        address _from
    )
    public onlyAuthorized returns (uint256)
    {
        address _sender = msg.sender;
        uint256 _refubdableLength = refundable[_from][_sender].length;
        uint256 _balanceLokedUp = 0;
        if (_refubdableLength > 0) {
            uint256 _lockupsLength = lockups[_from].length;
            for (uint256 i = 0; i < _refubdableLength; i = i + 2) {
                if (refundable[_from][_sender][i] > block.timestamp) { // solium-disable-line security/no-block-members
                    _balanceLokedUp = _balanceLokedUp.add(refundable[_from][_sender][i + 1]);  
                    for (uint256 j = 0; j < _lockupsLength; j = j + 2) {
                        if (lockups[_from][j] == refundable[_from][_sender][i] && lockups[_from][j + 1] == refundable[_from][_sender][i + 1]) {
                            lockups[_from][j] = 0;
                            lockups[_from][j + 1] = 0;
                            break;
                        }
                    }   
                    refundable[_from][_sender][i] = 0;
                    refundable[_from][_sender][i + 1] = 0;                 
                }    
            }

            if (_balanceLokedUp > 0) {
                require(_balanceLokedUp <= balances[_from], "Refund request less than balance.");

                balances[_from] = balances[_from].sub(_balanceLokedUp);
                balances[_sender] = balances[_sender].add(_balanceLokedUp);
                emit Refund(_from, _sender, _balanceLokedUp);
                emit Transfer(_from, _sender, _balanceLokedUp);
            }
        }
        return _balanceLokedUp;
    }

    /**
     * @dev Lockup amount till release time
     * @param _who address Address gets the lockedup amount
     * @param _amount uint256 Amount to lockup
     * @param _lockups uint256[] List of lockups    
     * @param _refundable bool Is locked up amount refundable     
     */     
    function _lockup(
        address _who, 
        uint256 _amount, 
        uint256[] _lockups, 
        bool _refundable) 
    internal 
    {
        uint256 _lockupsLength = _lockups.length;
        if (_lockupsLength > 0) {
            require(_who != address(0), "Lockup target address can't be zero.");
            require(_amount > 0, "Lockup amount should be > 0.");   

            uint256 _balanceLokedUp = 0;
            address _sender = msg.sender;
            for (uint256 i = 0; i < _lockupsLength; i = i + 2) {
                if (_lockups[i] > block.timestamp) { // solium-disable-line security/no-block-members
                    lockups[_who].push(_lockups[i]);
                    lockups[_who].push(_lockups[i + 1]);
                    _balanceLokedUp = _balanceLokedUp.add(_lockups[i + 1]);
                    if (_refundable) {
                        refundable[_who][_sender].push(_lockups[i]);
                        refundable[_who][_sender].push(_lockups[i + 1]);
                    }
                }
            }

            require(_balanceLokedUp <= _amount, "Can't lockup more than transferred amount.");
            emit Lockup(_who, _amount, _lockups);
        }            
    }      
}
