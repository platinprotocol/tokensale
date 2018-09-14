/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");


module.exports = function(deployer) {
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
