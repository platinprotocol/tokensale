/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */
const thread = require("../tools/sleep.js");
const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinICOLockup = artifacts.require("PlatinICOLockup.sol");
const PlatinICORegular = artifacts.require("PlatinICORegular.sol");


module.exports =  function(deployer, network, accounts) {
    let rate, wallet, openingTime, closingTime;
    thread.sleep(20000);
    rate = 1000;

    wallet = accounts[0]; // TODO change to the real one
    openingTime = 1540728000 // 2018-10-28 12:00 NOTICE: Keep in sync
    closingTime = 1543622400 // 2018-12-01 00:00 NOTICE: Keep in sync

    deployer.deploy(
        PlatinICO,                       
        rate,
        wallet,
        PlatinToken.address,   
        openingTime,
        closingTime
    ).then(() => {
        thread.sleep(20000);
        return deployer.deploy(
            PlatinICOLockup,
            PlatinICO.address
        );
    }).then(() => {
        thread.sleep(20000);
        return deployer.deploy(
            PlatinICORegular,
            PlatinICO.address
        );
    });
};