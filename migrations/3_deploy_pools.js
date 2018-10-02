/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const PlatinToken = artifacts.require("PlatinToken.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");


module.exports =  function(deployer) {

    const advisorsPoolInitial = "70000000000000000000000000"; // NOTICE: Keep in sync
    const foundersPoolInitial = "190000000000000000000000000"; // NOTICE: Keep in sync
    const preIcoPoolInitial = "13473782000000000000000000"; // NOTICE: Keep in sync

    deployer.deploy(
        AdvisorsPool,
        PlatinToken.address,
        advisorsPoolInitial
    ).then(() => {
        return deployer.deploy(
            FoundersPool,
            PlatinToken.address,
            foundersPoolInitial
        );
    }).then(() => {
        return deployer.deploy(
            PreIcoPool,
            PlatinToken.address,
            preIcoPoolInitial
        );
    });
};