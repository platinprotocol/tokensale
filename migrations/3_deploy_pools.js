const PlatinToken = artifacts.require("PlatinToken.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");


module.exports =  function(deployer) {
    deployer.deploy(
        AdvisorsPool,
        PlatinToken.address
    ).then(() => {
        return deployer.deploy(
            FoundersPool,
            PlatinToken.address
        );
    }).then(() => {
        return deployer.deploy(
            PreIcoPool,
            PlatinToken.address
        );
    });
};