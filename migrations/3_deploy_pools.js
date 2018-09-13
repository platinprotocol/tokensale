const PlatinToken = artifacts.require("PlatinToken.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const AirdropsPool = artifacts.require("./pools/AirdropsPool.sol");
const EcosystemPool = artifacts.require("./pools/EcosystemPool.sol");
const EmployeesPool = artifacts.require("./pools/EmployeesPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const MiningPool = artifacts.require("./pools/MiningPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");
const ReservesPool = artifacts.require("./pools/ReservesPool.sol");

module.exports =  function(deployer) {

    deployer.deploy(
        AdvisorsPool,
        PlatinToken.address
    ).then(() => {
        return deployer.deploy(
            AirdropsPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            EcosystemPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            EmployeesPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            FoundersPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            MiningPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            PreIcoPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            ReservesPool,
            PlatinToken.address
        );
    });
};