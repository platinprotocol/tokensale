const timestamp = require("unix-timestamp");

const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");

module.exports =  function(deployer, network, accounts) {
    let rate, wallet, openingTime, closingTime;

    rate = 1000;

    if (network == "mainnet") {
        wallet = accounts[0]; // TODO change to the real one
        openingTime = timestamp.fromDate('2018-08-01 12:00:00'); // TODO change to the real one
        closingTime = timestamp.fromDate('2018-10-01 12:00:00'); // TODO change to the real one
    } else {
        wallet = accounts[0];
        openingTime = timestamp.fromDate('2018-07-14 12:00:00');
        closingTime = timestamp.fromDate('2018-08-01 12:00:00');       
    }

    deployer.deploy(
        PlatinICO,                       
        rate,
        wallet,
        PlatinToken.address,   
        openingTime,
        closingTime,                  
        { gas: 2200000}
    );
};