const PlatinToken = artifacts.require("PlatinToken.sol");

module.exports = function(deployer) {
    deployer.deploy(PlatinToken);
};
