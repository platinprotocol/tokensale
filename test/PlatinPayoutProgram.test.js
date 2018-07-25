const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { zeroAddress }  = require('./helpers/zeroAddress');
const { EVMRevert } = require('./helpers/EVMRevert');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinPayoutProgram', (accounts) => {

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
});