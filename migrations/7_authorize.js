/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */
const thread = require("../tools/sleep.js");
const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");


module.exports = function(deployer) {
    let token, tge;
    thread.sleep(20000);
    deployer.then(() => {
        return PlatinToken.deployed()
    }).then(_token => {
        token =_token;
        return PlatinTGE.deployed();
    }).then(_tge => {          
        tge = _tge;
        return tge.PRE_ICO_POOL();
    }).then(preIcoPool => {
        return token.authorize(preIcoPool);
    }).then(() => {
        return tge.LIQUID_POOL();        
    }).then(liquidPool => {
        thread.sleep(20000);
        return token.authorize(liquidPool);        
    }).then(() => {
        return tge.ICO();        
    }).then(ico => {
        thread.sleep(20000);
        return token.authorize(ico);
    }).then(() => {
        return tge.MINING_POOL();
    }).then(miningPool => {
        thread.sleep(20000);
        return token.authorize(miningPool);
    }).then(() => {
        return tge.FOUNDERS_POOL();
    }).then(foundersPool => {
        thread.sleep(20000);
        return token.authorize(foundersPool);
    }).then(() => {
        return tge.EMPLOYEES_POOL();
    }).then(employeesPool => {
        thread.sleep(20000);
        return token.authorize(employeesPool);
    }).then(() => {
        return tge.AIRDROPS_POOL();
    }).then(airdropsPool => {
        thread.sleep(20000);
        return token.authorize(airdropsPool);
    }).then(() => {
        return tge.RESERVES_POOL();
    }).then(reservesPool => {
        thread.sleep(20000);
        return token.authorize(reservesPool);
    }).then(() => {
        return tge.ADVISORS_POOL();
    }).then(advisorsPool => {
        thread.sleep(20000);
        return token.authorize(advisorsPool);
    }).then(() => {
        return tge.ECOSYSTEM_POOL();
    }).then(ecosystemPool => {
        thread.sleep(20000);
        return token.authorize(ecosystemPool);
    }).then(() => {
        return tge.UNSOLD_RESERVE();
    }).then(unsold_reserve => {
        thread.sleep(20000);
        return token.authorize(unsold_reserve);
    });
};
