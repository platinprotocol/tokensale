pragma solidity ^0.4.24;

import "./PlatinICO.sol";


/**
 * @title PlatinICO Lockup Purchase Proxy
 * @dev proxy contract that call payable buyLockupTokens function in PlatinICO contract
 */
contract PlatinICOLockup {

    PlatinICO public ico;


    constructor(PlatinICO _ico) public {
        ico = _ico;
    }

    function () external payable {
        ico.buyLockupTokens.value(msg.value)(msg.sender);
    }
}