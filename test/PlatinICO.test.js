const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const PlatinTGEMinICOMock = artifacts.require('PlatinTGEMinICOMock');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { zeroAddress }  = require('./helpers/zeroAddress');
const { EVMRevert } = require('./helpers/EVMRevert');
const { increaseTimeTo, duration } = require('.//helpers/increaseTime');
const { ether } = require('./helpers/ether');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinICO', (accounts) => {

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
            await env.ico.setTGE(tgeExpected).should.be.fulfilled;

            const tgeActual = await env.ico.tge();
            tgeActual.should.be.equal(tgeExpected);
        });

        it('should not set TGE as zero address', async() => {
            await env.ico.setTGE(zeroAddress).should.be.rejectedWith(EVMRevert);
        });    

        it('should not set TGE twice', async() => {
            await env.ico.setTGE(env.tge.address).should.be.fulfilled;        
            await env.ico.setTGE(env.tge.address).should.be.rejectedWith(EVMRevert);
        });     
    });

    describe('purchase', function () {
        it('should be able purchase tokens', async() => {
            const purchaser = accounts[0];
            const value = ether(1); 
            
            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            await performTge(env);

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
            await env.ico.buyTokens(purchaser, { value: value, from: purchaser }).should.be.fulfilled;  
            
            const balanceExpected = tokens;
            const balanceActual = await env.token.balanceOf(purchaser);
            
            balanceExpected.should.be.bignumber.equal(balanceActual);               
        });  

        it('should be able purchase lockup tokens', async() => {
            const purchaser = accounts[0];
            const value = ether(1); 
            
            const rateLockup = await env.tge.TOKEN_RATE_LOCKUP();            
            const tokens = value.mul(rateLockup);

            await performTge(env);

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
            await env.ico.purchaseLockupTokens({ value: value, from: purchaser }).should.be.fulfilled;
            
            const balanceLockupExpected = tokens;
            const balanceLockupActual = await env.token.balanceLockedUp(purchaser);
            
            balanceLockupExpected.should.be.bignumber.equal(balanceLockupActual);               
        });

        it('should not be able purchase tokens with less than min purchase amount of funds', async() => {
            const purchaser = accounts[0];
            const minPurchase = await env.tge.MIN_PURCHASE_AMOUNT();
            const value = minPurchase.sub(ether(0.1));

            await performTge(env);

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
            await env.ico.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);           
        });  

        it('should not be able purchase tokens more than ico supply', async() => {
            const purchaser = accounts[0];
            const minPurchase = await env.tge.MIN_PURCHASE_AMOUNT();
            const value = minPurchase.add(ether(0.1));

            const tgeMock = await PlatinTGEMinICOMock.new(
                env.token.address,
                env.preIco.address,
                env.ico.address,
                env.ppp.address,
                env.stdVesting.address,
                env.unsVesting.address
            ).should.be.fulfilled;

            await performTge(env, tgeMock);

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
            await env.ico.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);             
        });         
    });

    describe('finalization', function () {
        it('should be able to do finalization', async() => {
            await performTge(env);

            await increaseTimeTo(env.closingTime + duration.minutes(1));
            await env.ico.finalize().should.be.fulfilled;

            const balanceExpected = new BigNumber(0);
            const balanceActual = await env.token.balanceOf(env.ico.address);
            
            balanceExpected.should.be.bignumber.equal(balanceActual);              
        });

        it('should not be able to do finalization twice', async() => {
            await performTge(env);
            await increaseTimeTo(env.closingTime + duration.minutes(1));
            await env.ico.finalize().should.be.fulfilled;
            await env.ico.finalize().should.be.rejectedWith(EVMRevert);            
        });        

        it('should not be able to do finalization before closing time', async() => {
            await performTge(env);
            await env.ico.finalize().should.be.rejectedWith(EVMRevert);            
        });     
        
        it('should not be able to do zero balance finalization distribution', async() => {
            const purchaser = accounts[0];
            const value = await env.tge.MIN_PURCHASE_AMOUNT();

            const tgeMock = await PlatinTGEMinICOMock.new(
                env.token.address,
                env.preIco.address,
                env.ico.address,
                env.ppp.address,
                env.stdVesting.address,
                env.unsVesting.address
            ).should.be.fulfilled;  

            await performTge(env, tgeMock);

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
            await env.ico.buyTokens(purchaser, { value: value, from: purchaser }).should.be.fulfilled;         

            await increaseTimeTo(env.closingTime + duration.minutes(1));
            await env.ico.finalize().should.be.fulfilled;
            
            const balanceExpected = new BigNumber(0);
            const balanceActual = await env.token.balanceOf(env.ppp.address);

            balanceExpected.should.be.bignumber.equal(balanceActual);
        });          
    });
});