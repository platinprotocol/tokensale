pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/NoOwner.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./PlatinVesting.sol";
import "./PlatinTGE.sol";
import "./PlatinICO.sol";


/**
 * @title PlatinToken
 */
contract PlatinToken is StandardToken, NoOwner, Pausable {
    using SafeMath for uint256;

    string public constant name = "Platin Token"; // solium-disable-line uppercase
    string public constant symbol = "PTNX"; // solium-disable-line uppercase
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    uint256 public constant TOTAL_SUPPLY = 10000000000 * (10 ** uint256(decimals)); // 10,000,000,000 PTNX

    // token holders
    address[] public holders;

    // holder number
    mapping (address => uint256) public holderNumber;

    // lockedup amount
    mapping (address => uint256) public lockedup;

    // Vested struct
    struct Vested {
        uint256 amount;
        PlatinVesting vesting;
    }

    // vested amount and vesting contract address
    mapping (address => Vested) public vested;

    // Platin TGE contract
    PlatinTGE public tge;

    // Platin ICO contract
    PlatinICO public ico;


    // allocation event logging
    event Allocate(address indexed to, uint256 amount);

    // onlyTGE modifier
    modifier onlyTGE() {
        require (msg.sender == address(tge), ""); // TODO: provide an error msg
        _;
    }

    // onlyICO modifier
    modifier onlyICO() {
        require (msg.sender == address(ico), ""); // TODO: provide an error msg
        _;
    }    


    // set TGE contract
    function setTGE(PlatinTGE _tge) public onlyOwner {
        require(tge == address(0), ""); // TODO: provide an error msg
        require(_tge != address(0), ""); // TODO: provide an error msg
        tge = _tge;
    }

    // set ICO contract
    function setICO(PlatinICO _ico) public onlyOwner {
        require(ico == address(0), ""); // TODO: provide an error msg
        require(_ico != address(0), ""); // TODO: provide an error msg
        ico = _ico;
    }

    // allocate tokens during TGE
    function allocate(address _to, uint256 _amount, address _vesting) public onlyTGE returns (bool) {
        require(_to != address(0), ""); // TODO: provide an error msg
        require(_amount > 0, ""); // TODO: provide an error msg

        vesting(_to, _amount, _vesting);
        
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);

        require(totalSupply_ <= TOTAL_SUPPLY, ""); // TODO: provide an error msg

        emit Allocate(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;        
    }

    // lock up transfers till release date for the specified amount purchased on the ico
    function lockup(address _who, uint256 _amount) public onlyICO returns (bool) {
        lockedup[_who] = lockedup[_who].add(_amount);
        return true;
    }    

    // has address vested amount
    function hasVested(address _who) public view returns (bool) {
        return vested[_who].amount > 0;
    }

    // has address locked up amount
    function hasLockedUp(address _who) public view returns (bool) {
        return lockedup[_who] > 0;
    }

    // balance vested
    function balanceVested(address _who) public view returns (uint256) {
        if (hasVested(_who)) {
            return vested[_who].vesting.balanceVested(vested[_who].amount);
        }
        return 0;
    }

    // balance locked up
    function balanceLokedUp(address _who) public view returns (uint256) {
        if (hasLockedUp(_who)) {
            if (tge.LOCKUP_RELEASE_DATE() > block.timestamp) // solium-disable-line security/no-block-members
                return lockedup[_who];
        }
        return 0;
    }    

    // balance spot due the vested and lockup amounts
    function balanceSpot(address _who) public view returns (uint256) {
        uint256 _balanceSpot = balanceOf(_who);
        _balanceSpot = _balanceSpot.sub(balanceVested(_who));
        _balanceSpot = _balanceSpot.sub(balanceLokedUp(_who));
        return _balanceSpot;
    }     

    // transfer tokens with vesting 
    function transferWithVesting(address _to, uint256 _value, address _vesting) public returns (bool) {        
        vesting(_to, _value, _vesting);
        return transfer(_to, _value);
    }       

    // transferFrom tokens with vesting 
    function transferFromWithVesting(address _from, address _to, uint256 _value, address _vesting) public returns (bool) {
        vesting(_to, _value, _vesting);
        return transferFrom(_from, _to, _value);
    }          

    // standard transfer function with the vesting and lockup checks
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(transferAllowed(msg.sender, _value), ""); // TODO: provide an error msg
        preserveHolders(msg.sender, _to, _value);
        return super.transfer(_to, _value);
    }

    // standard transferFrom function with the vesting and lockup checks
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(transferAllowed(_from, _value), ""); // TODO: provide an error msg
        preserveHolders(_from, _to, _value);
        return super.transferFrom(_from, _to, _value);
    }

    // @return true if contract is not paused and transfer operation is allowed due the vesting and lockup checks
    function transferAllowed(address _from, uint256 _value) public view returns (bool) {
        if (paused)
            return false;
        if (hasVested(_from) || hasLockedUp(_from)) {
            if (_value > balanceSpot(_from)) 
                return false;
        }
        return true;
    }

     // get holders count
    function getHoldersCount() public view returns (uint256) {
        return holders.length;
    }

    // preserve holders list
    function preserveHolders(address _from, address _to, uint256 _value) internal {
        addHolder(_to);   
        if (balances[_from].sub(_value) == 0) 
            removeHolder(_from);
    }

    // remove holder from the holders list
    function removeHolder(address _holder) internal {
        uint256 _number = holderNumber[_holder];

        if (_number == 0 || holders.length == 0 || _number > holders.length)
            return;

        uint256 _index = _number.sub(1);
        uint256 _lastIndex = holders.length.sub(1);
        address _lastHolder = holders[_lastIndex];

        if (_index != _lastIndex) {
            holders[_index] = _lastHolder;
            holderNumber[_lastHolder] = _number;
        }

        holderNumber[_holder] = 0;
        holders.length = _lastIndex;
    } 

    // add holder to the holders list
    function addHolder(address _holder) internal {
        if (holderNumber[_holder] == 0) {
            holders.push(_holder);
            holderNumber[_holder] = holders.length;
        }
    }

    // vesting internal function
    function vesting(address _to, uint256 _amount, address _vesting) internal {
        if (_vesting != address(0)) {
            require(_to != address(0), ""); // TODO: provide an error msg
            require(_amount > 0, ""); // TODO: provide an error msg
            require(balanceVested(_to) == 0, ""); // TODO: provide an error msg

            vested[_to].amount = _amount;
            vested[_to].vesting = PlatinVesting(_vesting);
        }
    }
}
