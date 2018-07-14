const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports = function(deployer) {
    let ico;
    deployer.then(() => {
        return PlatinICO.deployed();
    }).then(_ico => {
        ico = _ico;
    }).then(() => {
        return ico.setTGE(PlatinTGE.address);
    });
};
