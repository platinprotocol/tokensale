const PlatinICOLockupProxy = artifacts.require("PlatinICOLockupProxy.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");

module.exports =  function(deployer) {
    deployer.deploy(
        PlatinICOLockupProxy,
        PlatinICO.address
    );
};