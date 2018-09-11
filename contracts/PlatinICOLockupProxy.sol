pragma solidity ^0.4.24;

import "./PlatinICO.sol";


/**
 * @title PlatinICOLockupProxy
 * @notice proxy contract that call payable purchaseLockupTokens function in PlatinICO contract
 */
contract PlatinICOLockupProxy {

    PlatinICO public platinICO;


    constructor(PlatinICO _platinICO) {
        platinICO = _platinICO;
    }

    function () external payable {
        platinICO.purchaseLockupTokens.value(msg.value)(msg.sender);
    }
}