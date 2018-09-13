const PlatinToken = artifacts.require("PlatinToken.sol");
const PlatinICO = artifacts.require("PlatinICO.sol");
const PlatinTGE = artifacts.require("PlatinTGE.sol");
const AdvisorsPool = artifacts.require("./pools/AdvisorsPool.sol");
const FoundersPool = artifacts.require("./pools/FoundersPool.sol");
const PreIcoPool = artifacts.require("./pools/PreIcoPool.sol");

module.exports =  function(deployer) {

    const unsoldReserve = '0xef34779ad86cd818e86e0ec1096186d35377a474';
    const miningPool = '0xb20aa81e63c8259be247a64295f13e0c79480215';
    const employeesPool = '0xbcafab8c459aaf0b6aa882d78d8d51135405289e';
    const airdropsPool = '0xb20aa81e63c8259be247a64295f13e0c79480213';
    const reservesPool = '0xb20aa81e63c8259be247a64295f13e0c79480212';
    const ecosystemPool = '0xb20aa81e63c8259be247a64295f13e0c79480211';

    deployer.deploy(
        PlatinTGE,
        PlatinToken.address,
        PreIcoPool.address,
        PlatinICO.address,
        miningPool,
        FoundersPool.address,
        employeesPool,
        airdropsPool,
        reservesPool,
        AdvisorsPool.address,
        ecosystemPool,
        unsoldReserve
    );
};