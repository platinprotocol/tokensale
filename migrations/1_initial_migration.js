/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const Migrations = artifacts.require("./Migrations.sol");


module.exports = function(deployer) {
    deployer.deploy(Migrations);
};
