/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */
const thread = require("../tools/sleep.js");
const PlatinToken = artifacts.require("PlatinToken.sol");


module.exports = function(deployer) {
    thread.sleep(20000);
    deployer.deploy(PlatinToken);
};
