const PlatinToken = artifacts.require("PlatinToken.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");


// TODO: deploy all pools
// TODO: do we need Named Pool contract for every pool instead of one but deployed many times?

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