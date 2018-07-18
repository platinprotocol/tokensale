const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinPreICO = artifacts.require("PlatinPreICO.sol");

module.exports =  function(deployer, network, accounts) {

    deployer.deploy(
        PlatinPreICO,
        PlatinToken.address,                   
        { gas: 1200000}
    );
};