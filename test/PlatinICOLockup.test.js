/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const PlatinICOLockup = artifacts.require('PlatinICOLockup');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { zeroAddress }  = require('./helpers/zeroAddress');
const { EVMRevert } = require('./helpers/EVMRevert');
const { increaseTimeTo } = require('.//helpers/increaseTime');
const { ether } = require('./helpers/ether');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinICOLockup', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async () => {
        await setup(accounts, env);
    });

    it('should not be able instantiate contract with zero ICO addresses', async() => {
        await PlatinICOLockup.new(
            zeroAddress,
        ).should.be.rejectedWith(EVMRevert);      
    });    

    it('should be able to purchase lockup tokens using proxy functionality', async() => {
        const purchaser = accounts[0];
        const value = ether(1); 
        
        const rateLockup = await env.tge.TOKEN_RATE_LOCKUP();            
        const tokens = value.mul(rateLockup);

        await performTge(env);

        await increaseTimeTo(env.openingTime);
        await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
        await env.icoLockup.send(value, { from: purchaser }).should.be.fulfilled;
        
        const balanceLockupExpected = tokens;
        const balanceLockupActual = await env.token.balanceLockedUp(purchaser);
        
        balanceLockupExpected.should.be.bignumber.equal(balanceLockupActual);               
    });
});