/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */
const thread = require("../tools/sleep.js");
const PlatinToken = artifacts.require("PlatinToken.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");


module.exports =  function(deployer) {
    thread.sleep(20000);
    const advisorsPoolInitial = "70000000000000000000000000"; // NOTICE: Keep in sync
    const foundersPoolInitial = "190000000000000000000000000"; // NOTICE: Keep in sync
    const preIcoPoolInitial = "20000000000000000000000000"; // NOTICE: Keep in sync

    deployer.deploy(
        AdvisorsPool,
        PlatinToken.address,
        advisorsPoolInitial
    ).then(() => {
        thread.sleep(20000);
        return deployer.deploy(
            FoundersPool,
            PlatinToken.address,
            foundersPoolInitial
        );
    }).then(() => {
        thread.sleep(20000);
        return deployer.deploy(
            PreIcoPool,
            PlatinToken.address,
            preIcoPoolInitial
        );
    });
};