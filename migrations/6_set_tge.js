/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */
const thread = require("../tools/sleep.js");
const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");


module.exports = function(deployer) {
    thread.sleep(20000);
    deployer.then(() => {
        return PlatinToken.deployed()
    }).then(token => {
        thread.sleep(20000);
        return token.setTGE(PlatinTGE.address);
    }).then(() => {
        thread.sleep(20000);
         return PlatinICO.deployed();
    }).then(ico => {
        thread.sleep(20000);
        return ico.setTGE(PlatinTGE.address);
    });
};
