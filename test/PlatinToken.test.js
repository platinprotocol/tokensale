const PlatinTGEMock = artifacts.require('PlatinTGEMock');

const { zeroAddress }  = require('./helpers/zeroAddress');
const { EVMRevert } = require('./helpers/EVMRevert');
const { advanceBlock } = require('./helpers/advanceToBlock');
const { increaseTimeTo, duration } = require('.//helpers/increaseTime');
const { ether } = require('./helpers/ether');

const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinToken', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });    

    beforeEach(async () => {
        await setup(accounts, env);
    });

    describe('tge', function () {
        it('should set TGE', async() => {
            const tgeExpected = env.tge.address;
            await env.token.setTGE(tgeExpected).should.be.fulfilled;

            const tgeActual = await env.token.tge();
            tgeActual.should.be.equal(tgeExpected);
        });

        it('should not set TGE as zero address', async() => {
            await env.token.setTGE(zeroAddress).should.be.rejectedWith(EVMRevert);
        });    

        it('should not set TGE twice', async() => {
            await env.token.setTGE(env.tge.address).should.be.fulfilled;        
            await env.token.setTGE(env.tge.address).should.be.rejectedWith(EVMRevert);
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
    
        it('should not be able to call allocate from the arbitrary address', async() => {
            const from = accounts[1];
            const to = accounts[2];
            const value = 1000;
    
            await env.token.setTGE(env.tge.address);
            await env.token.allocate(to, value, { from: from }).should.be.rejectedWith(EVMRevert);
        });     
        
        it('should not be able allocate tokens to zero address', async() => {
            const tgeMock = await PlatinTGEMock.new(
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
            await env.token.setTGE(tgeMock.address).should.be.fulfilled; 
            await tgeMock.allocateZeroAddress().should.be.rejectedWith(EVMRevert);
        });
    
        it('should not be able allocate tokens with zero amount', async() => {
            const tgeMock = await PlatinTGEMock.new(
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
            await env.token.setTGE(tgeMock.address).should.be.fulfilled; 
            await tgeMock.allocateZeroAmount().should.be.rejectedWith(EVMRevert);
        });    
    
        it('should not be able allocate more than total supply', async() => {
            const tgeMock = await PlatinTGEMock.new(
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
            await env.token.setTGE(tgeMock.address).should.be.fulfilled; 
            await tgeMock.allocateMore().should.be.rejectedWith(EVMRevert);
        });          
    });

    describe('lockup', function () {    
        it('should have locked up amount after lockup', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            const starthasLockups = await env.token.hasLockups(to);

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens, [env.closingTime + duration.weeks(1), tokens], false, { from: from }).should.be.fulfilled;
            
            const endhasLockups = await env.token.hasLockups(to);

            starthasLockups.should.be.equal(false);
            endhasLockups.should.be.equal(true);
        });    

        it('should be able to get count of locked up amounts', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            const startLockedUpCount = await env.token.lockupsCount(to);

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.fulfilled;
            
            const endLockedUpCount= await env.token.lockupsCount(to);
            
            startLockedUpCount.should.be.bignumber.equal(new BigNumber(0));
            endLockedUpCount.should.be.bignumber.equal(new BigNumber(2));
        });           
        
        it('should free locked up amount after release time', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens, [env.closingTime + duration.weeks(1), tokens], false, { from: from }).should.be.fulfilled;
            
            const startBalanceSpotExpected = new BigNumber(0);
            const startBalanceSpotActual = await env.token.balanceSpot(to);  
            const startbalanceLockedUpExpected = tokens; 
            const startbalanceLockedUpActual = await env.token.balanceLockedUp(to);

            await increaseTimeTo(env.closingTime + duration.weeks(1) + 1);
            
            const endBalanceSpotExpected = tokens;
            const endBalanceSpotActual = await env.token.balanceSpot(to);  
            const endbalanceLockedUpExpected = new BigNumber(0); 
            const endbalanceLockedUpActual = await env.token.balanceLockedUp(to);

            startBalanceSpotExpected.should.be.bignumber.equal(startBalanceSpotActual);
            startbalanceLockedUpExpected.should.be.bignumber.equal(startbalanceLockedUpActual);
            endBalanceSpotExpected.should.be.bignumber.equal(endBalanceSpotActual);
            endbalanceLockedUpExpected.should.be.bignumber.equal(endbalanceLockedUpActual);            
        });        

        it('should be able perform transferWithLockup and transferFromWithLockup', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            const fullBalanceExpected = tokens;
            const lockedUpBalanceExpected = tokens;      

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.fulfilled;
            await env.token.approve(from, tokens.div(2));
            await env.token.transferFromWithLockup(from, to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.fulfilled;

            const fullBalanceActual = await env.token.balanceOf(to);
            const lockedUpBalanceActual = await env.token.balanceLockedUp(to);

            fullBalanceActual.should.be.bignumber.equal(fullBalanceExpected);
            lockedUpBalanceActual.should.be.bignumber.equal(lockedUpBalanceExpected);
        });      

        it('should not be able perform transferWithLockup and transferFromWithLockup from the arbitrary address', async() => {
            const from = accounts[1];
            const to = accounts[2];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.rejectedWith(EVMRevert);
            await env.token.approve(from, tokens.div(2)).should.be.fulfilled;
            await env.token.transferFromWithLockup(from, to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.rejectedWith(EVMRevert);
        });   

        it('should not be able lockup with zero release time', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            const startLockedUpBalance = new BigNumber(0);   

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens, [0, tokens], false, { from: from }).should.be.fulfilled;
            
            const endLockedUpBalance = await env.token.balanceLockedUp(to);   
            
            startLockedUpBalance.should.be.bignumber.equal(endLockedUpBalance);
        });

        it('should be able refund', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            const expectedStartLockBalance = tokens;

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens, [env.closingTime, tokens], true, { from: from }).should.be.fulfilled;

            const startLockedUpBalance = await env.token.balanceLockedUp(to);

            expectedStartLockBalance.should.be.bignumber.equal(startLockedUpBalance);

            await env.token.refundLockedUp(to, { from: from }).should.be.fulfilled;

            const expectedEndLockBalance = new BigNumber(0);
            const endLockedUpBalance = await env.token.balanceLockedUp(to);

            expectedEndLockBalance.should.be.bignumber.equal(endLockedUpBalance);

        });


        // it('shoud not be able perform lockup to zero address', async() => {
        //     const tokenLockupMock = await TokenLockupMock.new().should.be.fulfilled;
        //     await tokenLockupMock.zeroAddressLockup().should.be.rejectedWith(EVMRevert);
        // });
        //
        // it('shoud not be able perform lockup with zero amount', async() => {
        //     const tokenLockupMock = await TokenLockupMock.new().should.be.fulfilled;
        //     await tokenLockupMock.zeroAmountLockup().should.be.rejectedWith(EVMRevert);
        // });
        //
        // it('shoud not be able perform lockup in the past', async() => {
        //     const tokenLockupMock = await TokenLockupMock.new().should.be.fulfilled;
        //     await tokenLockupMock.lockupInPast().should.be.rejectedWith(EVMRevert);
        // });
    });

    describe('balance', function () {             
        it('should be able calculate full, spot, lockedup and vested balance', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            const fullBalanceExpected = tokens;
            const lockedUpBalanceExpected = tokens;
            const spotBalanceExpected = new BigNumber(0);

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transferWithLockup(to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.fulfilled;
            await env.token.transferWithLockup(to, tokens.div(2), [env.closingTime + duration.weeks(1), tokens.div(2)], false, { from: from }).should.be.fulfilled;

            const fullBalanceActual = await env.token.balanceOf(to);
            const spotBalanceActual = await env.token.balanceSpot(to);
            const lockedUpBalanceActual = await env.token.balanceLockedUp(to);

            fullBalanceActual.should.be.bignumber.equal(fullBalanceExpected);
            spotBalanceActual.should.be.bignumber.equal(spotBalanceExpected);
            lockedUpBalanceActual.should.be.bignumber.equal(lockedUpBalanceExpected);
        });    

        it('should not be able to transfer or transferFrom more than balance spot', async() => {
            const from = accounts[0];
            const to = accounts[1];
            const value = ether(3);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            await performTge(env);
            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(from).should.be.fulfilled;
            await env.ico.buyTokens(from, { value: value, from: from }).should.be.fulfilled;

            await env.token.transfer(to, tokens.div(3), { from: from }).should.be.fulfilled;
            await env.token.transferWithLockup(to, tokens.div(3), [env.closingTime + duration.weeks(1), tokens.div(3)], false, { from: from }).should.be.fulfilled;
            await env.token.transferWithLockup(to, tokens.div(3), [env.closingTime + duration.weeks(1), tokens.div(3)], false, { from: from }).should.be.fulfilled;

            await env.token.transfer(from, tokens.div(3).add(1), { from: to }).should.be.rejectedWith(EVMRevert);
            await env.token.approve(from, tokens.div(3).add(1), { from: to }).should.be.fulfilled;
            await env.token.transferFrom(to, from, tokens.div(3).add(1), { from: to }).should.be.rejectedWith(EVMRevert);
        });         
    });
});