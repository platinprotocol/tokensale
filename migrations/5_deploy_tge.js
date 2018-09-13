const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const AirdropsPool = artifacts.require("./pools/AirdropsPool.sol");
const EcosystemPool = artifacts.require("./pools/EcosystemPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const MiningPool = artifacts.require("./pools/MiningPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");
const ReservesPool = artifacts.require("./pools/ReservesPool.sol");
const EmployeesPool = artifacts.require("./pools/EmployeesPool.sol");

module.exports =  function(deployer) {

    const unsoldReserve = 0xef34779Ad86Cd818E86e0ec1096186D35377c474;

    deployer.deploy(
        PlatinTGE,
        PlatinToken.address,
        PreIcoPool.address,
        PlatinICO.address,
        MiningPool.address,
        FoundersPool.address,
        EmployeesPool.address,
        AirdropsPool.address,
        ReservesPool.address,
        AdvisorsPool.address,
        EcosystemPool.address,
        unsoldReserve
    );
};