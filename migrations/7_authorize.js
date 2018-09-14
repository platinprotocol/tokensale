const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");

module.exports = function(deployer) {
    let token, tge;

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
        return tge.ICO();        
    }).then(ico => {
        return token.authorize(ico);
    }).then(() => {
        return tge.MINING_POOL();
    }).then(miningPool => {
        return token.authorize(miningPool);
    }).then(() => {
        return tge.FOUNDERS_POOL();
    }).then(foundersPool => {
        return token.authorize(foundersPool);
    }).then(() => {
        return tge.EMPLOYEES_POOL();
    }).then(employeesPool => {
        return token.authorize(employeesPool);
    }).then(() => {
        return tge.AIRDROPS_POOL();
    }).then(airdropsPool => {
        return token.authorize(airdropsPool);
    }).then(() => {
        return tge.RESERVES_POOL();
    }).then(reservesPool => {
        return token.authorize(reservesPool);
    }).then(() => {
        return tge.ADVISORS_POOL();
    }).then(advisorsPool => {
        return token.authorize(advisorsPool);
    }).then(() => {
        return tge.ECOSYSTEM_POOL();
    }).then(ecosystemPool => {
        return token.authorize(ecosystemPool);
    }).then(() => {
        return tge.UNSOLD_RESERVE();
    }).then(unsold_reserve => {
        return token.authorize(unsold_reserve);
    });
};
