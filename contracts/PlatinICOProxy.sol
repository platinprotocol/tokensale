pragma solidity ^0.4.24;

import "./PlatinICO.sol";


/**
 * @title PlatinICOProxy
 * @notice proxy contract that call payable no name function in PlatinICO contract
 */
contract PlatinICOProxy {

    PlatinICO public platinICO;


    constructor(PlatinICO _platinICO) {
        platinICO = _platinICO;
    }

    function () external payable {
        platinICO.buyTokens.value(msg.value)(msg.sender);
    }
}