const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports = function(deployer) {
    let token;
    deployer.then(() => {
        return PlatinToken.deployed()
    }).then(_token => {
        token = _token;
    }).then(() => {
        return token.setICO(PlatinICO.address);
    }).then(() => {
        return token.setTGE(PlatinTGE.address);
    });
};
