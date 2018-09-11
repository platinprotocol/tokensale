const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports = function(deployer) {
    console.log(PlatinTGE.address);

    deployer.then(() => {
        return PlatinToken.deployed()
    }).then(token => {
        return token.setTGE(PlatinTGE.address);
    }).then(() => {          
         return PlatinICO.deployed();
    }).then(ico => {
        return ico.setTGE(PlatinTGE.address);
    });
};
