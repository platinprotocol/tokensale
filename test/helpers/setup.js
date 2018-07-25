const { duration } = require('./increaseTime');
const { latestTime } = require('./latestTime');

const PlatinVesting = artifacts.require('PlatinVesting');

const PlatinToken = artifacts.require('PlatinToken');
const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinPreICO = artifacts.require('PlatinPreICO');
const PlatinICO = artifacts.require('PlatinICO');
const PlatinPayoutProgram = artifacts.require('PlatinPayoutProgram');
const PlatinStandardVesting = artifacts.require('PlatinStandardVesting');
const PlatinUnsoldVesting = artifacts.require('PlatinUnsoldVesting');


module.exports = async function(accounts, env) {

    let rate = 1000;
    let wallet = accounts[0];

    env.openingTime = (await latestTime()) + duration.weeks(1);
    env.closingTime = env.openingTime + duration.weeks(1);
    env.afterClosingTime = env.closingTime + duration.seconds(1);

    env.stdVesting = await PlatinStandardVesting.new();
    env.unsVesting = await PlatinUnsoldVesting.new();

    env.testVesting = await PlatinVesting.new(4, 
        [env.openingTime + duration.hours(1), 
         env.openingTime + duration.hours(2),
         env.openingTime + duration.hours(2),
         env.openingTime + duration.hours(4),
        ]
    );

    env.token = await PlatinToken.new();

    env.preIco = await PlatinPreICO.new(
        env.token.address
    );    

    env.ico = await PlatinICO.new(
        rate,
        wallet,
        env.token.address,   
        env.openingTime,
        env.closingTime
    );

    env.ppp = await PlatinPayoutProgram.new(
        env.token.address
    );        
   
    env.tge = await PlatinTGE.new(
        env.token.address,
        env.preIco.address,
        env.ico.address,
        env.ppp.address,
        env.stdVesting.address,
        env.unsVesting.address
    );
};
