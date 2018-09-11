const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinPool = artifacts.require("PlatinPool.sol");

// TODO: deploy all pools
// TODO: do we need Named Pool contract for every pool instead of one but deployed many times?

module.exports =  function(deployer, network, accounts) {

    deployer.deploy(
        PlatinPool,
        PlatinToken.address
    );
};