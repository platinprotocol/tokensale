/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const { duration } = require('./increaseTime');
const { latestTime } = require('./latestTime');

const PlatinToken = artifacts.require('PlatinToken.sol');
const PlatinTGE = artifacts.require('PlatinTGE.sol');
const PlatinICO = artifacts.require('PlatinICO.sol');
const PlatinICORegular = artifacts.require('PlatinICORegular.sol');
const PlatinICOLockup = artifacts.require('PlatinICOLockup.sol');
const PlatinPool = artifacts.require("./pools/PlatinPool.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");

const BigNumber = web3.BigNumber;

module.exports = async function(accounts, env) {
    env.unsoldReserve = '0xef34779Ad86Cd818E86e0ec1096186D35377c474'; // NOTICE: Keep in sync
    env.miningPool = '0x378135f66fFC9F70Bb522b3c9b25ed4b8c23dE50'; // NOTICE: Keep in sync
    env.employeesPool = '0xB3c518D4C15567De725d535F47e755196A3310A4'; // NOTICE: Keep in sync
    env.airdropsPool = '0x4575479B1dF9305c0594542Dc66cdAD37932177F'; // NOTICE: Keep in sync
    env.reservesPool = '0x4fFcaee0380Da173538A333d01E7718c533b935f'; // NOTICE: Keep in sync
    env.ecosystemPool = '0xE375e16FFbc36216F2708D668eBa131E64A4aC81'; // NOTICE: Keep in sync

    env.poolInitial = new BigNumber("10000000000000000"); // NOTICE: Keep in sync
    env.advisorsPoolInitial = new BigNumber("70000000000000000000000000"); // NOTICE: Keep in sync
    env.foundersPoolInitial = new BigNumber("190000000000000000000000000"); // NOTICE: Keep in sync
    env.preIcoPoolInitial = new BigNumber("20000000000000000000000000"); // NOTICE: Keep in sync

    let rate = 1000;
    let wallet = accounts[0];

    env.tgeTime = (await latestTime()) + duration.days(1);

    env.openingTime = (await latestTime()) + duration.weeks(1);
    env.closingTime = env.openingTime + duration.weeks(1);
    env.afterClosingTime = env.closingTime + duration.seconds(1);

    env.token = await PlatinToken.new();

    env.pool = await PlatinPool.new(
        env.token.address,
        env.poolInitial
    );

    env.advisorsPool = await AdvisorsPool.new(
        env.token.address,
        env.advisorsPoolInitial
    ); 

    env.foundersPool = await FoundersPool.new(
        env.token.address,
        env.foundersPoolInitial
    );

    env.preIcoPool = await PreIcoPool.new(
        env.token.address,
        env.preIcoPoolInitial
    );

    env.ico = await PlatinICO.new(
        rate,
        wallet,
        env.token.address,
        env.openingTime,
        env.closingTime
    );

    env.tge = await PlatinTGE.new(
        env.tgeTime,
        env.token.address,
        env.preIcoPool.address,
        env.ico.address,
        env.miningPool,
        env.foundersPool.address,
        env.employeesPool,
        env.airdropsPool,
        env.reservesPool,
        env.advisorsPool.address,
        env.ecosystemPool,
        env.unsoldReserve
    );

    env.icoRegular = await PlatinICORegular.new(
        env.ico.address
    );

    env.icoLockup = await PlatinICOLockup.new(
        env.ico.address
    );

    await env.token.authorize(await env.tge.PRE_ICO_POOL());
    await env.token.authorize(await env.tge.ICO());
    await env.token.authorize(await env.tge.MINING_POOL());
    await env.token.authorize(await env.tge.FOUNDERS_POOL());
    await env.token.authorize(await env.tge.EMPLOYEES_POOL());
    await env.token.authorize(await env.tge.AIRDROPS_POOL());
    await env.token.authorize(await env.tge.RESERVES_POOL());
    await env.token.authorize(await env.tge.ADVISORS_POOL());
    await env.token.authorize(await env.tge.ECOSYSTEM_POOL());
};
