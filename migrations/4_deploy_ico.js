const timestamp = require("unix-timestamp");

const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinICOLockup = artifacts.require("PlatinICOLockup.sol");
const PlatinICORegular = artifacts.require("PlatinICORegular.sol");

module.exports =  function(deployer, network, accounts) {
    let rate, wallet, openingTime, closingTime;

    rate = 1000;

    wallet = accounts[0]; // TODO change to the real one
    openingTime = timestamp.fromDate('2018-10-28 12:00:00'); // TODO change to the real one
    closingTime = timestamp.fromDate('2018-12-01 00:00:00'); // TODO change to the real one

    deployer.deploy(
        PlatinICO,                       
        rate,
        wallet,
        PlatinToken.address,   
        openingTime,
        closingTime
    ).then(() => {
        return deployer.deploy(
            PlatinICOLockup,
            PlatinICO.address
        );
    }).then(() => {
        return deployer.deploy(
            PlatinICORegular,
            PlatinICO.address
        );
    });
};