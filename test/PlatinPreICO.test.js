// const setup = require('./helpers/setup');
// const performTge = require('./helpers/performTge');
//
// const PlatinPreICO = artifacts.require('PlatinPreICO');
//
// const { advanceBlock } = require('./helpers/advanceToBlock');
// const { zeroAddress }  = require('./helpers/zeroAddress');
// const { EVMRevert } = require('./helpers/EVMRevert');
//
// const BigNumber = web3.BigNumber;
//
// require('chai')
//   .use(require('chai-as-promised'))
//   .use(require('chai-bignumber')(BigNumber))
//   .should();
//
// contract('PlatinPreICO', (accounts) => {
//
//     let env = {};
//
//     before(async function () {
//         // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
//         await advanceBlock();
//     });
//
//     beforeEach(async () => {
//         await setup(accounts, env);
//     });
//
//     describe('tge', function () {
//         it('should set TGE', async() => {
//             const tgeExpected = env.tge.address;
//             await env.preIco.setTGE(tgeExpected).should.be.fulfilled;
//
//             const tgeActual = await env.preIco.tge();
//             tgeActual.should.be.equal(tgeExpected);
//         });
//
//         it('should not set TGE as zero address', async() => {
//             await env.preIco.setTGE(zeroAddress).should.be.rejectedWith(EVMRevert);
//         });
//
//         it('should not set TGE twice', async() => {
//             await env.preIco.setTGE(env.tge.address).should.be.fulfilled;
//             await env.preIco.setTGE(env.tge.address).should.be.rejectedWith(EVMRevert);
//         });
//     });
//
//     it('should not be able instantiate PreICO with Token zero address', async() => {
//         await PlatinPreICO.new(
//             zeroAddress
//         ).should.be.rejectedWith(EVMRevert);
//     });
//
//     describe('distribution', function () {
//         it('should be able distribute pre ico sale', async() => {
//             to = accounts[1];
//             tokens = new BigNumber(100);
//
//             await performTge(env);
//
//             await env.preIco.distributePreICOSale(to, tokens, zeroAddress).should.be.fulfilled;
//
//             balanceExpected = tokens
//             balanceActual = await env.token.balanceOf(to);
//
//             balanceExpected.should.be.bignumber.equal(balanceActual);
//         });
//
//         it('should be able distribute pre ico sale with vesting', async() => {
//             to = accounts[0];
//             tokens = new BigNumber(100);
//
//             await performTge(env);
//
//             await env.preIco.distributePreICOSale(to, tokens, env.testVesting.address).should.be.fulfilled;
//
//             balanceVestedExpected = tokens
//             balanceVestedActual = await env.token.balanceVested(to);
//
//             balanceVestedExpected.should.be.bignumber.equal(balanceVestedActual);
//         });
//
//         it('should be able distribute many pre ico sales', async() => {
//             to1 = accounts[0];
//             to2 = accounts[1];
//             tokens = new BigNumber(100);
//
//             await performTge(env);
//
//             await env.preIco.distributeManyPreICOSales([to1, to2], [tokens, tokens], [zeroAddress, zeroAddress]).should.be.fulfilled;
//
//             balanceExpected1 = tokens
//             balanceActual1 = await env.token.balanceOf(to1);
//
//             balanceExpected2 = tokens
//             balanceActual2 = await env.token.balanceOf(to);
//
//             balanceExpected1.should.be.bignumber.equal(balanceActual1);
//             balanceExpected2.should.be.bignumber.equal(balanceActual2);
//         });
//
//         it('should be able distribute many pre ico sales with vesting', async() => {
//             to1 = accounts[0];
//             to2 = accounts[1];
//             tokens = new BigNumber(100);
//
//             await performTge(env);
//
//             await env.preIco.distributeManyPreICOSales([to1, to2], [tokens, tokens], [env.testVesting.address, env.testVesting.address]).should.be.fulfilled;
//
//             balanceVestedExpected1 = tokens
//             balanceVestedActual1 = await env.token.balanceVested(to1);
//
//             balanceVestedExpected2 = tokens
//             balanceVestedActual2 = await env.token.balanceVested(to2);
//
//             balanceVestedExpected1.should.be.bignumber.equal(balanceVestedActual1);
//             balanceVestedExpected2.should.be.bignumber.equal(balanceVestedActual2);
//         });
//
//         it('should not be able distribute pre ico sale twice to the same address', async() => {
//             to1 = accounts[0];
//             to2 = accounts[0];
//             tokens = new BigNumber(100);
//
//             await performTge(env);
//
//             await env.preIco.distributePreICOSale(to, tokens, env.testVesting.address).should.be.fulfilled;
//             await env.preIco.distributePreICOSale(to, tokens, env.testVesting.address).should.be.rejectedWith(EVMRevert);
//         });
//
//         it('should not be able distribute more than pre ico amount', async() => {
//             to = accounts[0];
//             tokens = await env.tge.PRE_ICO_AMOUNT();
//
//             await performTge(env);
//
//             await env.preIco.distributePreICOSale(to, tokens.add(1), env.testVesting.address).should.be.rejectedWith(EVMRevert);
//         });
//
//         it('should not be able distribute many pre ico sales with arguments with different length', async() => {
//             to1 = accounts[0];
//             to2 = accounts[1];
//             tokens = new BigNumber(100);
//
//             await performTge(env);
//
//             await env.preIco.distributeManyPreICOSales([to1, to2], [tokens], [env.testVesting.address, env.testVesting.address]).should.be.rejectedWith(EVMRevert);
//             await env.preIco.distributeManyPreICOSales([to1, to2], [tokens, tokens], [env.testVesting.address]).should.be.rejectedWith(EVMRevert);
//         });
//     });
// });