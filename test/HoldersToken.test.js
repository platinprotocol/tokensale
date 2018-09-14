/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const HoldersTokenMock = artifacts.require('HoldersTokenMock');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { increaseTimeTo } = require('.//helpers/increaseTime');
const { ether } = require('./helpers/ether');

const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('HoldersToken', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });    

    beforeEach(async () => {
        await setup(accounts, env);
    });

    describe('holders', function () { 
        it('should count token holders', async() => {
            const holder1 = accounts[0];
            const holder2  = accounts[1];
            const value = ether(1); 

            await performTge(env);

            const startHoldersCount = await env.token.holdersCount();

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(holder1).should.be.fulfilled;
            await env.ico.addAddressToWhitelist(holder2).should.be.fulfilled;
            await env.ico.buyTokens(holder1, { value: value, from: holder1 }).should.be.fulfilled;
            await env.ico.buyTokens(holder2, { value: value, from: holder2 }).should.be.fulfilled;
            
            const endHoldersCount = await env.token.holdersCount();
            
            endHoldersCount.should.be.bignumber.equal(startHoldersCount.add(2));        
        });

        it('should remove token holders with zero balances', async() => {
            const holder1 = accounts[0];
            const holder2  = accounts[1];
            const value = ether(1);

            const rate = await env.tge.TOKEN_RATE();
            const tokens = value.mul(rate);

            await performTge(env);

            const startHoldersCount = await env.token.holdersCount();  

            await increaseTimeTo(env.openingTime);
            await env.ico.addAddressToWhitelist(holder1).should.be.fulfilled;
            await env.ico.addAddressToWhitelist(holder2).should.be.fulfilled;
            await env.ico.buyTokens(holder1, { value: value, from: holder1 }).should.be.fulfilled;
            await env.ico.buyTokens(holder2, { value: value, from: holder2 }).should.be.fulfilled;

            await env.token.transfer(holder1, tokens, { from: holder2 }).should.be.fulfilled;
            
            const endHoldersCount = await env.token.holdersCount();

            endHoldersCount.should.be.bignumber.equal(startHoldersCount.add(1));      
        });    
        
        it('should not touch holders when remove zero holder', async() => {
            const holdersTokenMock = await HoldersTokenMock.new();
            const startHoldersCount = await holdersTokenMock.holdersCount();  
            await holdersTokenMock.removeZeroHolder().should.be.fulfilled;  
            const endHoldersCount = await holdersTokenMock.holdersCount();
            endHoldersCount.should.be.bignumber.equal(startHoldersCount); 
        });        
    });
});