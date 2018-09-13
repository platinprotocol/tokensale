pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "./PlatinICO.sol";


/**
 * @title PlatinICO Regular Purchase Proxy
 * @dev Proxy contract that calls payable buyTokens function in PlatinICO contract
 */
contract PlatinICORegular {

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
    * @dev fallback function, receives ether and sends it to the ICO contract calling payable buyTokens function
    */
    function () external payable {
        ico.buyTokens.value(msg.value)(msg.sender);
    }
}