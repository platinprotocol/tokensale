const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

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
    });
});