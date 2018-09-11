pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "./PlatinICO.sol";


/**
 * @title PlatinICO Regular Purchase Proxy
 * @dev proxy contract that calls payable buyTokens function in PlatinICO contract
 */
contract PlatinICORegular {

    PlatinICO public ico;


    constructor(PlatinICO _ico) public {
        ico = _ico;
    }

    function () external payable {
        ico.buyTokens.value(msg.value)(msg.sender);
    }
}