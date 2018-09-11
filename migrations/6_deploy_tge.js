const PlatinStandardVesting = artifacts.require("PlatinStandardVesting.sol");
const PlatinUnsoldVesting = artifacts.require("PlatinUnsoldVesting.sol");
const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinPreICO = artifacts.require("PlatinPreICO.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports =  function(deployer) {    
    deployer.deploy(
        PlatinTGE,
        PlatinToken.address,
        PlatinPreICO.address,
        PlatinICO.address,
        PlatinStandardVesting.address,
        PlatinUnsoldVesting.address
    );
};