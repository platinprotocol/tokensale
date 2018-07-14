const PlatinStandardVesting = artifacts.require("PlatinStandardVesting.sol");
const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports =  function(deployer) {
    deployer.deploy(
        PlatinTGE,
        PlatinToken.address,
        PlatinICO.address,
        PlatinStandardVesting.address,
        { gas: 6700000}
    );
};