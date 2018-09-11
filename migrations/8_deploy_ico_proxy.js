const PlatinICOProxy = artifacts.require("PlatinICOProxy.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");

module.exports =  function(deployer) {
    deployer.deploy(
        PlatinICOProxy,
        PlatinICO.address
    );
};