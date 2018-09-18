/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinTokenMock = artifacts.require('PlatinTokenMock');
const PlatinTGEMock = artifacts.require('PlatinTGEMock');
const { increaseTimeTo, duration } = require('./helpers/increaseTime');
const { latestTime } = require('./helpers/latestTime');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { EVMRevert } = require('./helpers/EVMRevert');
const { zeroAddress }  = require('./helpers/zeroAddress');

const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinTGE', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async () => {
        await setup(accounts, env);
    });

    it('should not be able instantiate TGE with zero addresses', async() => {
        await PlatinTGE.new(
            env.tgeTime,
            zeroAddress,
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
        ).should.be.rejectedWith(EVMRevert);       

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            zeroAddress,
            env.ico.address,
            env.miningPool,
            env.foundersPool.address,
            env.employeesPool,
            env.airdropsPool,
            env.reservesPool,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert); 

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            zeroAddress,
            env.miningPool,
            env.foundersPool.address,
            env.employeesPool,
            env.airdropsPool,
            env.reservesPool,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            zeroAddress,
            env.foundersPool.address,
            env.employeesPool,
            env.airdropsPool,
            env.reservesPool,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert); 

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            env.miningPool,
            zeroAddress,
            env.employeesPool,
            env.airdropsPool,
            env.reservesPool,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            env.miningPool,
            env.foundersPool.address,
            zeroAddress,
            env.airdropsPool,
            env.reservesPool,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            env.miningPool,
            env.foundersPool.address,
            env.employeesPool,
            zeroAddress,
            env.reservesPool,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            env.miningPool,
            env.foundersPool.address,
            env.employeesPool,
            env.airdropsPool,
            zeroAddress,
            env.advisorsPool.address,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
            env.tgeTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            env.miningPool,
            env.foundersPool.address,
            env.employeesPool,
            env.airdropsPool,
            env.reservesPool,
            zeroAddress,
            env.ecosystemPool,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
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
            zeroAddress,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);

        await PlatinTGE.new(
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
            zeroAddress
        ).should.be.rejectedWith(EVMRevert);
    });
  
    it('should be able to correctly allocate tokens during TGE', async() => {
        const totalSupplyBeforeExpected = new BigNumber(0);
        const totalSupplyAfterExpected = await env.tge.TOTAL_SUPPLY();
        
        const salesSupplyExpected = await env.tge.SALES_SUPPLY();
        const miningPoolSupplyExpected = await env.tge.MINING_POOL_SUPPLY();
        const foundersAndEmployeesSupplyExpected = await env.tge.FOUNDERS_AND_EMPLOYEES_SUPPLY();
        const airdropsSupplyExpected = await env.tge.AIRDROPS_POOL_SUPPLY();
        const reservesSupplyExpected = await env.tge.RESERVES_POOL_SUPPLY();
        const advisorsSupplyExpected = await env.tge.ADVISORS_POOL_SUPPLY();
        const ecosystemSupplyExpected = await env.tge.ECOSYSTEM_POOL_SUPPLY();

        const totalSupplyBeforeActual = await env.token.totalSupply();

        await performTge(env);

        const preIcoPoolSupply = await env.token.balanceOf(await env.tge.PRE_ICO_POOL());
        const icoSupply = await  env.token.balanceOf(await env.tge.ICO());
        const foundersPoolSupply = await env.token.balanceOf(await env.tge.FOUNDERS_POOL());
        const employeesPoolSupply = await env.token.balanceOf(await env.tge.EMPLOYEES_POOL()); 

        const salesSupplyActual = preIcoPoolSupply.add(icoSupply);
        const miningPoolSupplyActual= await env.token.balanceOf(await env.tge.MINING_POOL());
        const foundersAndEmployeesSupplyActual = foundersPoolSupply.add(employeesPoolSupply);
        const airdropsSupplyActual = await env.token.balanceOf(await env.tge.AIRDROPS_POOL());
        const reservesSupplyActual = await env.token.balanceOf(await env.tge.RESERVES_POOL());
        const advisorsSupplyActual = await env.token.balanceOf(await env.tge.ADVISORS_POOL());
        const ecosystemSupplyActual = await env.token.balanceOf(await env.tge.ECOSYSTEM_POOL());        

        const totalSupplyAfterActual = await env.token.totalSupply();

        salesSupplyExpected.should.be.bignumber.equal(salesSupplyActual);
        miningPoolSupplyExpected.should.be.bignumber.equal(miningPoolSupplyActual);
        foundersAndEmployeesSupplyExpected.should.be.bignumber.equal(foundersAndEmployeesSupplyActual);
        airdropsSupplyExpected.should.be.bignumber.equal(airdropsSupplyActual);
        reservesSupplyExpected.should.be.bignumber.equal(reservesSupplyActual);
        advisorsSupplyExpected.should.be.bignumber.equal(advisorsSupplyActual);
        ecosystemSupplyExpected.should.be.bignumber.equal(ecosystemSupplyActual);

        totalSupplyBeforeActual.should.be.bignumber.equal(totalSupplyBeforeExpected);
        totalSupplyAfterActual.should.be.bignumber.equal(totalSupplyAfterExpected);
    });   

    it('should not be able to instantiate TGE contract with TGE time in the past', async() => {
        const tgePastTime = (await latestTime()) - duration.seconds(1);
        await PlatinTGE.new(
            tgePastTime,
            env.token.address,
            env.preIcoPool.address,
            env.ico.address,
            env.miningPool,
            env.foundersPool.address,
            env.employeesPool,
            env.airdropsPool,
            env.reservesPool,
            env.advisorsPool.address,
            zeroAddress,
            env.unsoldReserve
        ).should.be.rejectedWith(EVMRevert);
    });   

    it('should not be able to allocate tokens before TGE time', async() => {
        await env.token.setTGE(env.tge.address).should.be.fulfilled;        
        await env.tge.allocate().should.be.rejectedWith(EVMRevert);
    });    

    it('should not be able to allocate tokens during TGE twice', async() => {
        await performTge(env);
        env.tge.allocate().should.be.rejectedWith(EVMRevert);
    });
    
    it('should not be able to allocate wrong total supply during TGE', async() => {
        const token = await PlatinTokenMock.new().should.be.fulfilled;

        const tge = await PlatinTGEMock.new(
            env.tgeTime,
            token.address,
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
        ).should.be.fulfilled;
        
        await token.setTGE(tge.address).should.be.fulfilled;
        await increaseTimeTo(env.tgeTime);
        await tge.allocate().should.be.rejectedWith(EVMRevert);
    });   
});