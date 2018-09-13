pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "./PlatinICO.sol";


/**
 * @title PlatinICO Lockup Purchase Proxy
 * @dev Proxy contract that calls payable buyLockupTokens function in PlatinICO contract
 */
contract PlatinICOLockup {

    // Platin ICO contract
    PlatinICO public ico;


    /**
     * @dev Constructor
     * @param _ico address Address of the Platin ICO contract                              
     */  
    constructor(PlatinICO _ico) public {
        ico = _ico;
    }

   /**
    * @dev fallback function, receives ether and send it to the ICO contract calls payable buyTokens function
    */
    function () external payable {
        ico.buyLockupTokens.value(msg.value)(msg.sender);
    }
}