/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");


module.exports =  function(deployer) {

    const unsoldReserve = '0xef34779Ad86Cd818E86e0ec1096186D35377c474'; // NOTICE: Keep in sync
    const miningPool = '0x378135f66fFC9F70Bb522b3c9b25ed4b8c23dE50'; // NOTICE: Keep in sync
    const employeesPool = '0xB3c518D4C15567De725d535F47e755196A3310A4'; // NOTICE: Keep in sync
    const airdropsPool = '0x4575479B1dF9305c0594542Dc66cdAD37932177F'; // NOTICE: Keep in sync
    const reservesPool = '0x4fFcaee0380Da173538A333d01E7718c533b935f'; // NOTICE: Keep in sync
    const ecosystemPool = '0xE375e16FFbc36216F2708D668eBa131E64A4aC81'; // NOTICE: Keep in sync

    deployer.deploy(
        PlatinTGE,
        PlatinToken.address,
        PreIcoPool.address,
        PlatinICO.address,
        miningPool,
        FoundersPool.address,
        employeesPool,
        airdropsPool,
        reservesPool,
        AdvisorsPool.address,
        ecosystemPool,
        unsoldReserve
    );
};