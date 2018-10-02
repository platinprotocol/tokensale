pragma solidity ^0.4.25; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */


/**
 * @title Truffle Migrations
 * @dev Standard Truffle migrations contract.
 */
contract Migrations {

    // contract owner
    address public owner;

    // last ompleted migration numver
    uint public last_completed_migration; // solium-disable-line mixedcase

    // restricted modifier, restrict to the owner
    modifier restricted() {
        if (msg.sender == owner) 
            _;
    }
        

    /**
     * @dev Constructor
     */  
    constructor() public {
        owner = msg.sender;
    }

    /**
     * @dev Set migration as completed
     * @param completed uint Migration number
     */  
    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    /**
     * @dev Upgrade Migrations contract to the new one
     * @param new_address address New Migrations contract address
     */      
    function upgrade(address new_address) public restricted { // solium-disable-line mixedcase
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
