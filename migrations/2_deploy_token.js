/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const PlatinToken = artifacts.require("PlatinToken.sol");


module.exports = function(deployer) {
    deployer.deploy(PlatinToken);
};
