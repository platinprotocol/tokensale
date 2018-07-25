const PlatinStandardVesting = artifacts.require("PlatinStandardVesting.sol");
const PlatinUnsoldVesting = artifacts.require("PlatinUnsoldVesting.sol");

module.exports = function(deployer) {
    deployer.deploy(PlatinStandardVesting);
    deployer.deploy(PlatinUnsoldVesting);
};
