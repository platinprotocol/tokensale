const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinPool = artifacts.require("PlatinPool.sol");

module.exports =  function(deployer, network, accounts) {

    deployer.deploy(
        PlatinPool,
        PlatinToken.address
    );
};