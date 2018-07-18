const PlatinStandardVesting = artifacts.require("PlatinStandardVesting.sol");
const PlatinUnsoldVesting = artifacts.require("PlatinUnsoldVesting.sol");

module.exports = function(deployer) {
    deployer.deploy(PlatinStandardVesting, { gas: 1400000 });
    deployer.deploy(PlatinUnsoldVesting, { gas: 600000 });
};
