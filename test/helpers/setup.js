const timestamp = require("unix-timestamp");

const PlatinToken = artifacts.require('PlatinToken');
const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinICO = artifacts.require('PlatinICO');
const PlatinStandardVesting = artifacts.require('PlatinStandardVesting');


module.exports =  async function(accounts, env) {

    let rate = 1000;
    let wallet = accounts[0];
    let openingTime = timestamp.fromDate('2018-07-17 12:00:00');
    let closingTime = timestamp.fromDate('2018-08-01 12:00:00');       

    env.vesting = await PlatinStandardVesting.new({ gas: 800000 });

    env.token = await PlatinToken.new({ gas: 4000000 });

    env.ico = await PlatinICO.new(
        rate,
        wallet,
        env.token.address,   
        openingTime,
        closingTime,                  
        { gas: 2200000 }
    );
   
    env.tge = await PlatinTGE.new(
        env.token.address,
        env.ico.address,
        env.vesting.address,
        { gas: 6700000 }
    );

};
