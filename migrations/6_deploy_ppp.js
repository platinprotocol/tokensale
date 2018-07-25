const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinPayoutProgram = artifacts.require("PlatinPayoutProgram.sol");

module.exports =  function(deployer) {

    deployer.deploy(
        PlatinPayoutProgram,
        PlatinToken.address
    );
};