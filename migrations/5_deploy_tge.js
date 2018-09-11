const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports =  function(deployer) {    

    const preIcoPool = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO: change to the real one
    const ico = PlatinICO.address;
    const miningPool = 0x378135f66fFC9F70Bb522b3c9b25ed4b8c23dE50;
    const foundersPool = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO: change to the real one
    const employeesPool = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO: change to the real one
    const airdropsPool = 0x4575479B1dF9305c0594542Dc66cdAD37932177F;
    const reservesPool = 0x4fFcaee0380Da173538A333d01E7718c533b935f;
    const advisorsPool = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO: change to the real one
    const ecosystemPool = 0xef34779Ad86Cd818E86e0ec1096186D35377c474; // TODO: change to the real one

    const unsoldReserve = 0xef34779Ad86Cd818E86e0ec1096186D35377c474;

    deployer.deploy(
        PlatinTGE,
        PlatinToken.address,
        preIcoPool,
        ico,
        miningPool,
        foundersPool,
        employeesPool,
        airdropsPool,
        reservesPool,
        advisorsPool,
        ecosystemPool,
        unsoldReserve
    );
};