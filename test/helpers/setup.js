const { duration } = require('./increaseTime');
const { latestTime } = require('./latestTime');

const PlatinToken = artifacts.require('PlatinToken');
const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinICO = artifacts.require('PlatinICO');
const PlatinICORegular = artifacts.require('PlatinICORegular');
const PlatinICOLockup = artifacts.require('PlatinICOLockup');
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
module.exports = async function(accounts, env) {
    env.unsoldReserve = '0xef34779ad86cd818e86e0ec1096186d35377a474';
    env.miningPool = '0xbcafab8c459aaf0b6aa882d78d8d51135405289e';
    env.employeesPool = '0xef34779Ad86Cd818E86e0ec1096186D35377a123';
    env.airdropsPool = '0xb20aa81e63c8259be247a64295f13e0c79480213';
    env.reservesPool = '0xb20aa81e63c8259be247a64295f13e0c79480212';
    env.ecosystemPool = '0xb20aa81e63c8259be247a64295f13e0c79480211';

    let rate = 1000;
    let wallet = accounts[0];

    env.openingTime = (await latestTime()) + duration.weeks(1);
    env.closingTime = env.openingTime + duration.weeks(1);
    env.afterClosingTime = env.closingTime + duration.seconds(1);

    env.token = await PlatinToken.new();

    env.advisorsPool = await AdvisorsPool.new(
        env.token.address
    );

    env.foundersPool = await FoundersPool.new(
        env.token.address
    );

    env.preIcoPool = await PreIcoPool.new(
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


const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");
