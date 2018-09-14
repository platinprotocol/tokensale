const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const PlatinICORegular = artifacts.require('PlatinICORegular');

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

contract('PlatinICORegular', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async () => {
        await setup(accounts, env);
    });

    it('should not be able instantiate contract with zero ICO addresses', async() => {
        await PlatinICORegular.new(
            zeroAddress,
        ).should.be.rejectedWith(EVMRevert);      
    });        

    it('should be able to purchase tokens using proxy functionality', async() => {
        const purchaser = accounts[0];
        const value = ether(1); 
        
        const rate = await env.tge.TOKEN_RATE();
        const tokens = value.mul(rate);

        await performTge(env);

        await increaseTimeTo(env.openingTime);
        await env.ico.addAddressToWhitelist(purchaser).should.be.fulfilled;
        await env.icoRegular.send(value, { from: purchaser }).should.be.fulfilled;
        
        const balanceExpected = tokens;
        const balanceActual = await env.token.balanceOf(purchaser);
        
        balanceExpected.should.be.bignumber.equal(balanceActual);               
    });  
});