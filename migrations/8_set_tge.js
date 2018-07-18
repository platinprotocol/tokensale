const PlatinPayoutProgram = artifacts.require("PlatinPayoutProgram.sol");
const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinPreICO = artifacts.require("PlatinPreICO.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports = function(deployer) {
    console.log(PlatinTGE.address);

    deployer.then(() => {
        return PlatinToken.deployed()
    }).then(token => {
        return token.setTGE(PlatinTGE.address);
    }).then(() => {       
         return PlatinPreICO.deployed();
    }).then(preIco => {
         return preIco.setTGE(PlatinTGE.address);
    }).then(() => {          
         return PlatinICO.deployed();
    }).then(ico => {
         return ico.setTGE(PlatinTGE.address);
    }).then(() => {          
         return PlatinPayoutProgram.deployed();
    }).then(ppp => {
         return ppp.setTGE(PlatinTGE.address);
    });
};
