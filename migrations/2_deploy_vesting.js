const PlatinStandardVesting = artifacts.require("PlatinStandardVesting.sol");

module.exports = function(deployer) {
    deployer.deploy(PlatinStandardVesting, { gas: 800000 });
};
