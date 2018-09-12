const { duration } = require('./increaseTime');
const { latestTime } = require('./latestTime');

const PlatinVesting = artifacts.require('PlatinVesting');

const PlatinToken = artifacts.require('PlatinToken');
const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinPreICO = artifacts.require('PlatinPreICO');
const PlatinICO = artifacts.require('PlatinICO');
const PlatinStandardVesting = artifacts.require('PlatinStandardVesting');
const PlatinUnsoldVesting = artifacts.require('PlatinUnsoldVesting');
const PlatinICORegular = artifacts.require('PlatinICORegular');
const PlatinICOLockup = artifacts.require('PlatinICOLockup');
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const AirdropsPool = artifacts.require("./pools/AirdropsPool.sol");
const EcosystemPool = artifacts.require("./pools/EcosystemPool.sol");
const EmployeesPool = artifacts.require("./pools/EmployeesPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const MiningPool = artifacts.require("./pools/MiningPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");
const ReservesPool = artifacts.require("./pools/ReservesPool.sol");


module.exports = async function(accounts, env) {

    env.unsoldReserve = '0xef34779Ad86Cd818E86e0ec1096186D35377c474';

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

    env.advisorsPool = await AdvisorsPool.new(
        env.token.address
    );

    env.airdropsPool = await AirdropsPool.new(
        env.token.address
    );

    env.ecosystemPool = await EcosystemPool.new(
        env.token.address
    );

    env.employeesPool = await EmployeesPool.new(
        env.token.address
    );

    env.foundersPool = await FoundersPool.new(
        env.token.address
    );

    env.miningPool = await MiningPool.new(
        env.token.address
    );

    env.preIcoPool = await PreIcoPool.new(
        env.token.address
    );

    env.reservesPool = await ReservesPool.new(
        env.token.address
    );

    env.ico = await PlatinICO.new(
        rate,
        wallet,
        env.token.address,   
        env.openingTime,
        env.closingTime
    );

    env.tge = await PlatinTGE.new(
        env.token.address,
        env.preIcoPool.address,
        env.ico.address,
        env.miningPool.address,
        env.foundersPool.address,
        env.employeesPool.address,
        env.airdropsPool.address,
        env.reservesPool.address,
        env.advisorsPool.address,
        env.ecosystemPool.address,
        env.unsoldReserve
    );

    env.icoRegular = await PlatinICORegular.new(
        env.ico.address
    );

    env.icoLockup = await PlatinICOLockup.new(
        env.ico.address
    );
};
