const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinTokenMock = artifacts.require('PlatinTokenMock');

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
  
    it('should be able to allocate tokens during TGE', async() => {
        const totalSupplyBeforeExpected = new BigNumber(0);
        const totalSupplyAfterExpected = await env.tge.TOTAL_SUPPLY();
        
        const totalSupplyBeforeActual = await env.token.totalSupply();

        await performTge(env);

        const totalSupplyAfterActual = await env.token.totalSupply();

        totalSupplyBeforeActual.should.be.bignumber.equal(totalSupplyBeforeExpected);
        totalSupplyAfterActual.should.be.bignumber.equal(totalSupplyAfterExpected);
    });   

    it('should not be able to allocate tokens during TGE twice', async() => {
        await performTge(env);
        env.tge.allocate().should.be.rejectedWith(EVMRevert);
    });
    
    it('should not be able to allocate wrong total supply during TGE', async() => {
        const token = await PlatinTokenMock.new().should.be.fulfilled;

        const tge = await PlatinTGE.new(
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
        ).should.be.fulfilled;
        
        await token.setTGE(tge.address).should.be.fulfilled;
        await tge.allocate().should.be.rejectedWith(EVMRevert);
    });      
});