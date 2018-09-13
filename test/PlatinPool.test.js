const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinTokenMock = artifacts.require('PlatinTokenMock');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { EVMRevert } = require('./helpers/EVMRevert');
const { increaseTimeTo, duration } = require('.//helpers/increaseTime');

const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('AdviorsPool', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async () => {
        await setup(accounts, env);
    });
  
    it('should be able to distribution tokens', async() => {
        let owner = accounts[0];
        let beneficiary1 = accounts[1];
        let beneficiary2 = accounts[2];
        let beneficiary3 = accounts[3];
        const totalPoolAmount = await env.tge.AIRDROPS_POOL_SUPPLY();
        const distr1 = totalPoolAmount.div(4);
        const distr2 = totalPoolAmount.div(5);
        const distr3 = totalPoolAmount.div(5);
        const zeroBalance = new BigNumber(0);
        
        await performTge(env);

        await env.advisorsPool.addDistribution(
            beneficiary1, distr1, [env.closingTime, distr1], true, { from: owner }
                ).should.be.fulfilled;

        await env.advisorsPool.addDistribution(
            beneficiary2, distr2, [env.closingTime, distr2], true, { from: owner }
        ).should.be.fulfilled;

        await env.advisorsPool.addDistribution(
            beneficiary3, distr3, [env.closingTime, distr3], true, { from: owner }
        ).should.be.fulfilled;

        let beforDistr1 = await env.token.balanceOf(beneficiary1);
        let beforDistr2 = await env.token.balanceOf(beneficiary2);
        let beforDistr3 = await env.token.balanceOf(beneficiary3);

        zeroBalance.should.be.bignumber.equal(beforDistr1);
        zeroBalance.should.be.bignumber.equal(beforDistr2);
        zeroBalance.should.be.bignumber.equal(beforDistr3);

        let membersCount = await env.advisorsPool.membersCount();
        for (let i = 0; i < membersCount; i++) {
            let currB = await env.advisorsPool.members(i);
            await env.advisorsPool.distribute(currB).should.be.fulfilled;
        }

        let afterDistr1 = await env.token.balanceOf(beneficiary1);
        let afterDistr2 = await env.token.balanceOf(beneficiary2);
        let afterDistr3 = await env.token.balanceOf(beneficiary3);

        distr1.should.be.bignumber.equal(afterDistr1);
        distr2.should.be.bignumber.equal(afterDistr2);
        distr3.should.be.bignumber.equal(afterDistr3);

        let afterDistr1Locked = await env.token.balanceLockedUp(beneficiary1);
        let afterDistr2Locked = await env.token.balanceLockedUp(beneficiary2);
        let afterDistr3Locked = await env.token.balanceLockedUp(beneficiary3);

        distr1.should.be.bignumber.equal(afterDistr1Locked);
        distr2.should.be.bignumber.equal(afterDistr2Locked);
        distr3.should.be.bignumber.equal(afterDistr3Locked);

        await increaseTimeTo(env.closingTime);

        let duringTime1 = await env.token.balanceOf(beneficiary1);
        let duringTime2 = await env.token.balanceOf(beneficiary2);
        let duringTime3 = await env.token.balanceOf(beneficiary3);

        distr1.should.be.bignumber.equal(duringTime1);
        distr2.should.be.bignumber.equal(duringTime2);
        distr3.should.be.bignumber.equal(duringTime3);

        let duringTime1Locked = await env.token.balanceLockedUp(beneficiary1);
        let duringTime2Locked = await env.token.balanceLockedUp(beneficiary2);
        let duringTime3Locked = await env.token.balanceLockedUp(beneficiary3);

        zeroBalance.should.be.bignumber.equal(duringTime1Locked);
        zeroBalance.should.be.bignumber.equal(duringTime2Locked);
        zeroBalance.should.be.bignumber.equal(duringTime3Locked);

    });

    it('should be able to refund lockup', async() => {
        let owner = accounts[0];
        let beneficiary = accounts[1];
        const totalPoolAmount = await env.tge.AIRDROPS_POOL_SUPPLY();
        const distr = totalPoolAmount.div(2);
        const zeroBalance = new BigNumber(0);

        await performTge(env);

        await env.advisorsPool.addDistribution(
            beneficiary, distr, [env.closingTime, distr], true, { from: owner }
        ).should.be.fulfilled;

        let beforDistr = await env.token.balanceOf(beneficiary);
        zeroBalance.should.be.bignumber.equal(beforDistr);

        await env.advisorsPool.distribute(beneficiary).should.be.fulfilled;

        let afterDistr = await env.token.balanceOf(beneficiary);
        distr.should.be.bignumber.equal(afterDistr);

        let afterDistrLocked = await env.token.balanceLockedUp(beneficiary);
        distr.should.be.bignumber.equal(afterDistrLocked);

        await env.advisorsPool.refundLockedUp(beneficiary).should.be.fulfilled;
        await increaseTimeTo(env.closingTime);

        let duringTime = await env.token.balanceOf(beneficiary);
        zeroBalance.should.be.bignumber.equal(duringTime);
    });

});