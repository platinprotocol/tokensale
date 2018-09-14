/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const PlatinPool = artifacts.require('PlatinPool');
const PlatinTGE = artifacts.require('PlatinTGE');

const { advanceBlock } = require('./helpers/advanceToBlock');
const { zeroAddress }  = require('./helpers/zeroAddress');
const { EVMRevert } = require('./helpers/EVMRevert');
const { increaseTimeTo, duration } = require('.//helpers/increaseTime');
const expectEvent = require('./helpers/expectEvent');

const setup = require('./helpers/setup');
const performTge = require('./helpers/performTge');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinPool', (accounts) => {

    let env = {};

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    });

    beforeEach(async () => {
        await setup(accounts, env);
    });
  
    it('should not be able instantiate contract with zero ICO addresses', async() => {
        await PlatinPool.new(
            zeroAddress,
            env.poolInitial
        ).should.be.rejectedWith(EVMRevert);      
    });    

    describe('info', function () {    
        it('should be able to get correct distribution info', async() => { 
            const beneficiary = accounts[1];
            const distr = new BigNumber(1);
            const zero = new BigNumber(0);        
        
            const releaseTime = new BigNumber(env.closingTime);

            const tge = await PlatinTGE.new(
                env.token.address,
                env.pool.address,
                env.ico.address,
                env.miningPool,
                env.foundersPool.address,
                env.employeesPool,
                env.airdropsPool,
                env.reservesPool,
                env.advisorsPool.address,
                env.ecosystemPool,
                env.unsoldReserve
            );

            await performTge(env, tge);
            await env.token.authorize(env.pool.address);   

            const beforeMembersCount = await env.pool.membersCount();  
            beforeMembersCount.should.be.bignumber.equal(zero);

            let distribution = await env.pool.distribution(beneficiary);            
            let lockups = await env.pool.getLockups(beneficiary);   

            distribution[0].should.be.bignumber.equal(zero); // amount field
            distribution[1].should.be.bignumber.equal(zero); // refunded field
            distribution[2].should.be.equal(false); // refundable field
            distribution[3].should.be.equal(false); // distributed field
            lockups.should.be.deep.equal([]); // lockups field

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary, distr, [releaseTime, distr], true),
                'AddDistribution'
            );    

            const afterMembersCount = await env.pool.membersCount();  
            afterMembersCount.should.be.bignumber.equal(new BigNumber(1));            

            distribution = await env.pool.distribution(beneficiary);            
            lockups = await env.pool.getLockups(beneficiary);   

            distribution[0].should.be.bignumber.equal(distr); // amount field
            distribution[1].should.be.bignumber.equal(zero); // refunded field
            distribution[2].should.be.equal(true); // refundable field
            distribution[3].should.be.equal(false); // distributed field
            lockups.should.be.deep.equal([releaseTime, distr]); // lockups field                   

            await expectEvent.inTransaction(
                env.pool.distribute(beneficiary),
                'Distribute'
            );

            distribution = await env.pool.distribution(beneficiary);            
            lockups = await env.pool.getLockups(beneficiary);   

            distribution[0].should.be.bignumber.equal(distr); // amount field
            distribution[1].should.be.bignumber.equal(zero); // refunded field
            distribution[2].should.be.equal(true); // refundable field
            distribution[3].should.be.equal(true); // distributed field
            lockups.should.be.deep.equal([releaseTime, distr]); // lockups field                

            await env.pool.refundLockedUp(beneficiary).should.be.fulfilled;

            distribution = await env.pool.distribution(beneficiary);            
            lockups = await env.pool.getLockups(beneficiary);   

            distribution[0].should.be.bignumber.equal(distr); // amount field
            distribution[1].should.be.bignumber.equal(distr); // refunded field
            distribution[2].should.be.equal(true); // refundable field
            distribution[3].should.be.equal(true); // distributed field
            lockups.should.be.deep.equal([releaseTime, distr]); // lockups field
        });
    })    

    describe('add distribution', function () {    
        it('should be able to add distribution', async() => {    
            const beneficiary1 = accounts[1];
            const beneficiary2 = accounts[2];
            const beneficiary3 = accounts[3];
            const beneficiary4 = accounts[4];
            const totalPoolAmount = await env.poolInitial;
            const distr1 = totalPoolAmount.div(4);
            const distr2 = totalPoolAmount.div(5);
            const distr3_1 = totalPoolAmount.div(5);
            const distr3_2 = totalPoolAmount.div(10);
            const distr4 = totalPoolAmount.div(10);
            const zero = new BigNumber(0);        
        
            const releaseTime1 = new BigNumber(env.closingTime);
            const releaseTime2 = new BigNumber(env.closingTime + duration.weeks(1));

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary1, distr1, [releaseTime1, distr1], true),
                'AddDistribution'
            );    

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary2, distr2, [releaseTime1, distr2], false),
                'AddDistribution'
            );        

            await expectEvent.inTransaction(
                env.pool.addDistribution(
                    beneficiary3, distr3_1.add(distr3_2), [releaseTime1, distr3_1, releaseTime2, distr3_2], true),
                'AddDistribution'
            );    

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary4, distr4, [], false),
                'AddDistribution'
            );

            const distribution1 = await env.pool.distribution(beneficiary1);
            const lockups1 = await env.pool.getLockups(beneficiary1);

            distribution1[0].should.be.bignumber.equal(distr1); // amount field
            distribution1[1].should.be.bignumber.equal(zero); // refunded field
            distribution1[2].should.be.equal(true); // refundable field
            distribution1[3].should.be.equal(false); // distributed field
            lockups1.should.be.deep.equal([releaseTime1, distr1]);

            const distribution2 = await env.pool.distribution(beneficiary2);
            const lockups2 = await env.pool.getLockups(beneficiary2);

            distribution2[0].should.be.bignumber.equal(distr2);
            distribution2[1].should.be.bignumber.equal(zero);
            distribution2[2].should.be.equal(false);
            distribution2[3].should.be.equal(false);
            lockups2.should.be.deep.equal([releaseTime1, distr2]);
            
            const distribution3 = await env.pool.distribution(beneficiary3);
            const lockups3 = await env.pool.getLockups(beneficiary3);

            distribution3[0].should.be.bignumber.equal(distr3_1.add(distr3_2));
            distribution3[1].should.be.bignumber.equal(zero);
            distribution3[2].should.be.equal(true);
            distribution3[3].should.be.equal(false);
            lockups3.should.be.deep.equal([releaseTime1, distr3_1, releaseTime2, distr3_2]);
            
            const distribution4 = await env.pool.distribution(beneficiary4);
            const lockups4 = await env.pool.getLockups(beneficiary4);

            distribution4[0].should.be.bignumber.equal(distr4);
            distribution4[1].should.be.bignumber.equal(zero);
            distribution4[2].should.be.equal(false);
            distribution4[3].should.be.equal(false);
            lockups4.should.be.deep.equal([]);        
        });    

        it('should be able to add distribution <= initial/balance', async() => { 
            const beneficiary1 = accounts[1];
            const beneficiary2 = accounts[2];
            const beneficiary3 = accounts[3];

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary1, env.poolInitial, [], false),
                'AddDistribution'
            );      

            const allocated = await env.pool.allocated();

            allocated.should.be.bignumber.equal(env.poolInitial);
            
            const tge = await PlatinTGE.new(
                env.token.address,
                env.pool.address,
                env.ico.address,
                env.miningPool,
                env.foundersPool.address,
                env.employeesPool,
                env.airdropsPool,
                env.reservesPool,
                env.advisorsPool.address,
                env.ecosystemPool,
                env.unsoldReserve
            );

            await performTge(env, tge);
            
            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary2, env.preIcoPoolInitial.sub(env.poolInitial), [], false),
                'AddDistribution'
            );      
            
            await env.pool.addDistribution(beneficiary3, new BigNumber(1), [], false).should.be.rejectedWith(EVMRevert);
        });             
        
        it('should not be able to add distribution if there is no initial/balance', async() => { 
            const beneficiary = accounts[1];
            
            const pool = await PlatinPool.new(
                env.token.address,
                0
            );

            await pool.addDistribution(beneficiary, new BigNumber(1), [], false).should.be.rejectedWith(EVMRevert);
        });

        it('should be able to add distribution from an authorized address', async() => {
            const authorized = accounts[1];

            const beneficiary = accounts[2];
            const distr = new BigNumber(1);

            await env.pool.authorize(authorized).should.be.fulfilled;
            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary, distr, [], false, { from: authorized }),
                'AddDistribution'
            );  
        });    

        it('should not be able to add distribution from not authorized address', async() => {
            const notAuthorized = accounts[1];

            const beneficiary = accounts[2];
            const distr = new BigNumber(1);  

            await env.pool.addDistribution(beneficiary, distr, [], false, { from: notAuthorized }).should.be.rejectedWith(EVMRevert);
        });    

        it('should not be able to add distribution for the same beneficiary twice', async() => {
            const beneficiary = accounts[1];
            const distr = new BigNumber(1);

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary, distr, [], false),
                'AddDistribution'
            );  
            await env.pool.addDistribution(beneficiary, distr, [], false).should.be.rejectedWith(EVMRevert);
        });      
        
        it('should not be able to add distribution for the zero address', async() => {
            const beneficiary = zeroAddress;
            const distr = new BigNumber(1);

            await env.pool.addDistribution(beneficiary, distr, [], false).should.be.rejectedWith(EVMRevert);
        });       

        it('should not be able to add distribution with zero amount', async() => {
            const beneficiary = accounts[1];
            const zero = new BigNumber(0);

            await env.pool.addDistribution(beneficiary, zero, [], false).should.be.rejectedWith(EVMRevert);
        }); 


        it('should not be able to add distribution with the locked up amount > amount of distribution', async() => {
            const beneficiary = accounts[1];
            const distr = new BigNumber(1);
            const releaseTime = new BigNumber(env.closingTime);

            await env.pool.addDistribution(beneficiary, distr, [releaseTime, distr.add(1)], false).should.be.rejectedWith(EVMRevert);
        });      
        
    });    

    describe('distribution', function () {    
        it('should be able to do distribution (publically)', async() => {
            const beneficiary1 = accounts[1];
            const beneficiary2 = accounts[2];
            const beneficiary3 = accounts[3];
            const totalPoolAmount = await env.tge.PRE_ICO_POOL_AMOUNT();
            const distr1 = totalPoolAmount.div(4);
            const distr2 = totalPoolAmount.div(5);
            const distr3 = totalPoolAmount.div(5);
            const zero = new BigNumber(0);
            
            const releaseTime = new BigNumber(env.closingTime);

            const tge = await PlatinTGE.new(
                env.token.address,
                env.pool.address,
                env.ico.address,
                env.miningPool,
                env.foundersPool.address,
                env.employeesPool,
                env.airdropsPool,
                env.reservesPool,
                env.advisorsPool.address,
                env.ecosystemPool,
                env.unsoldReserve
            );

            await performTge(env, tge);
            await env.token.authorize(env.pool.address);

            await env.pool.addDistribution(
                beneficiary1, distr1, [releaseTime, distr1], true
            ).should.be.fulfilled;

            await env.pool.addDistribution(
                beneficiary2, distr2, [releaseTime, distr2], false
            ).should.be.fulfilled;

            await env.pool.addDistribution(
                beneficiary3, distr3, [], false
            ).should.be.fulfilled;

            const beforDistr1 = await env.token.balanceOf(beneficiary1);
            const beforDistr2 = await env.token.balanceOf(beneficiary2);
            const beforDistr3 = await env.token.balanceOf(beneficiary3);

            beforDistr1.should.be.bignumber.equal(zero);
            beforDistr2.should.be.bignumber.equal(zero);
            beforDistr3.should.be.bignumber.equal(zero);

            const membersCount = await env.pool.membersCount();
            for (let i = 0; i < membersCount; i++) {
                let b = await env.pool.members(i);
                await expectEvent.inTransaction(
                    env.pool.distribute(b, { from: accounts[i]}),
                    'Distribute'
                )    
            }

            const afterDistr1 = await env.token.balanceOf(beneficiary1);
            const afterDistr2 = await env.token.balanceOf(beneficiary2);
            const afterDistr3 = await env.token.balanceOf(beneficiary3);

            afterDistr1.should.be.bignumber.equal(distr1);
            afterDistr2.should.be.bignumber.equal(distr2);
            afterDistr3.should.be.bignumber.equal(distr3);

            const afterDistr1LockedUp = await env.token.balanceLockedUp(beneficiary1);
            const afterDistr2LockedUp = await env.token.balanceLockedUp(beneficiary2);
            const afterDistr3LockedUp = await env.token.balanceLockedUp(beneficiary3);

            afterDistr1LockedUp.should.be.bignumber.equal(distr1);
            afterDistr2LockedUp.should.be.bignumber.equal(distr2);
            afterDistr3LockedUp.should.be.bignumber.equal(zero);

            const afterDistr1Refundable = await env.token.balanceRefundable(beneficiary1, env.pool.address);
            const afterDistr2Refundable = await env.token.balanceRefundable(beneficiary2, env.pool.address);
            const afterDistr3Refundable = await env.token.balanceRefundable(beneficiary3, env.pool.address);        

            afterDistr1Refundable.should.be.bignumber.equal(distr1);
            afterDistr2Refundable.should.be.bignumber.equal(zero);
            afterDistr3Refundable.should.be.bignumber.equal(zero);

            await increaseTimeTo(releaseTime);

            const releasedDistr1 = await env.token.balanceOf(beneficiary1);
            const releasedDistr2 = await env.token.balanceOf(beneficiary2);
            const releasedDistr3 = await env.token.balanceOf(beneficiary3);

            releasedDistr1.should.be.bignumber.equal(distr1);
            releasedDistr2.should.be.bignumber.equal(distr2);
            releasedDistr3.should.be.bignumber.equal(distr3);

            const releasedDistr1LockedUp = await env.token.balanceLockedUp(beneficiary1);
            const releasedDistr2LockedUp = await env.token.balanceLockedUp(beneficiary2);
            const releasedDistr3LockedUp = await env.token.balanceLockedUp(beneficiary3);

            releasedDistr1LockedUp.should.be.bignumber.equal(zero);
            releasedDistr2LockedUp.should.be.bignumber.equal(zero);
            releasedDistr3LockedUp.should.be.bignumber.equal(zero);

            const releasedDistr1Refundable = await env.token.balanceRefundable(beneficiary1, env.pool.address);
            const releasedDistr2Refundable = await env.token.balanceRefundable(beneficiary2, env.pool.address);
            const releasedDistr3Refundable = await env.token.balanceRefundable(beneficiary3, env.pool.address);

            releasedDistr1Refundable.should.be.bignumber.equal(zero);
            releasedDistr2Refundable.should.be.bignumber.equal(zero);
            releasedDistr3Refundable.should.be.bignumber.equal(zero);        

        });

        it('should not be able to do distribution for beneficiary not listed in the distribution table', async() => {
            const beneficiary = accounts[1];
            await env.pool.distribute(beneficiary).should.be.rejectedWith(EVMRevert);
        });

        it('should not be able to do distribution for the same beneficiary twice', async() => {
            const beneficiary = accounts[1];
            const distr = new BigNumber(1);

            const tge = await PlatinTGE.new(
                env.token.address,
                env.pool.address,
                env.ico.address,
                env.miningPool,
                env.foundersPool.address,
                env.employeesPool,
                env.airdropsPool,
                env.reservesPool,
                env.advisorsPool.address,
                env.ecosystemPool,
                env.unsoldReserve
            );

            await performTge(env, tge);
            await env.token.authorize(env.pool.address);

            await expectEvent.inTransaction(
                env.pool.addDistribution(beneficiary, distr, [], false),
                'AddDistribution'
            );          

            await expectEvent.inTransaction(
                env.pool.distribute(beneficiary),
                'Distribute'
            );
            
            await env.pool.distribute(beneficiary).should.be.rejectedWith(EVMRevert);
        });    

    });    

    describe('refund', function () {    
        it('should be able to refund refundable locked up amount', async() => {
            const beneficiary = accounts[1];
            const totalPoolAmount = await env.preIcoPoolInitial
            const distr = totalPoolAmount.div(2);
            const zero = new BigNumber(0);

            const releaseTime = new BigNumber(env.closingTime);

            const tge = await PlatinTGE.new(
                env.token.address,
                env.pool.address,
                env.ico.address,
                env.miningPool,
                env.foundersPool.address,
                env.employeesPool,
                env.airdropsPool,
                env.reservesPool,
                env.advisorsPool.address,
                env.ecosystemPool,
                env.unsoldReserve
            );

            await performTge(env, tge);
            await env.token.authorize(env.pool.address);     
            
            const startAllocated = await env.pool.allocated();
            const startDistributed = await env.pool.distributed();

            // add distribution
            await env.pool.addDistribution(
                beneficiary, distr, [releaseTime, distr.div(2)], true
            ).should.be.fulfilled;

            const addedAllocated = await env.pool.allocated();
            const addedDistributed = await env.pool.distributed();

            const beforeDistr = await env.token.balanceOf(beneficiary);
            beforeDistr.should.be.bignumber.equal(zero);

            // distribute
            await env.pool.distribute(beneficiary).should.be.fulfilled;

            const distributedAllocated = await env.pool.allocated();
            const distributedDistributed = await env.pool.distributed();            

            const afterDistr = await env.token.balanceOf(beneficiary);
            afterDistr.should.be.bignumber.equal(distr);

            const afterDistrLockedUp = await env.token.balanceLockedUp(beneficiary);
            afterDistrLockedUp.should.be.bignumber.equal(distr.div(2));

            const afterDistrRefundable= await env.token.balanceRefundable(beneficiary, env.pool.address);
            afterDistrRefundable.should.be.bignumber.equal(distr.div(2));   

            const beforePoolBalance = await env.token.balanceOf(env.pool.address);

            // refund
            await env.pool.refundLockedUp(beneficiary).should.be.fulfilled;
            await increaseTimeTo(releaseTime);

            const refundedAllocated = await env.pool.allocated();
            const refundedDistributed = await env.pool.distributed();              

            const releasedDistr = await env.token.balanceOf(beneficiary);
            releasedDistr.should.be.bignumber.equal(distr.div(2));

            const afterPoolBalance = await env.token.balanceOf(env.pool.address);   
            
            afterPoolBalance.should.be.bignumber.equal(beforePoolBalance.add(afterDistrRefundable));
            afterPoolBalance.should.be.bignumber.equal(totalPoolAmount.mul(3).div(4));

            const distribution = await env.pool.distribution(beneficiary);
            distribution[1].should.be.bignumber.equal(afterDistrRefundable); // refunded field

            startAllocated.should.be.bignumber.equal(new BigNumber(0));
            startDistributed.should.be.bignumber.equal(new BigNumber(0));

            addedAllocated.should.be.bignumber.equal(distr);
            addedDistributed.should.be.bignumber.equal(new BigNumber(0));

            distributedAllocated.should.be.bignumber.equal(distr);
            distributedDistributed.should.be.bignumber.equal(distr);            

            refundedAllocated.should.be.bignumber.equal(distr.div(2));
            refundedDistributed.should.be.bignumber.equal(distr.div(2));
        });

        it('should not be able to get refund for non refundable locked up amount', async() => { 
            const beneficiary = accounts[1];
            const totalPoolAmount = await env.tge.PRE_ICO_POOL_AMOUNT();
            const distr = totalPoolAmount.div(2);
            const zero = new BigNumber(0);

            const releaseTime = new BigNumber(env.closingTime);

            const tge = await PlatinTGE.new(
                env.token.address,
                env.pool.address,
                env.ico.address,
                env.miningPool,
                env.foundersPool.address,
                env.employeesPool,
                env.airdropsPool,
                env.reservesPool,
                env.advisorsPool.address,
                env.ecosystemPool,
                env.unsoldReserve
            );

            await performTge(env, tge);
            await env.token.authorize(env.pool.address);        

            await env.pool.addDistribution(
                beneficiary, distr, [releaseTime, distr], false
            ).should.be.fulfilled;

            const beforeDistr = await env.token.balanceOf(beneficiary);
            beforeDistr.should.be.bignumber.equal(zero);

            await env.pool.distribute(beneficiary).should.be.fulfilled;

            const afterDistr = await env.token.balanceOf(beneficiary);
            afterDistr.should.be.bignumber.equal(distr);

            const afterDistrLockedUp = await env.token.balanceLockedUp(beneficiary);
            afterDistrLockedUp.should.be.bignumber.equal(distr);

            const beforePoolBalance = await env.token.balanceOf(env.pool.address);

            await env.pool.refundLockedUp(beneficiary).should.be.fulfilled;
            await increaseTimeTo(releaseTime);

            const releasedDistr = await env.token.balanceOf(beneficiary);
            releasedDistr.should.be.bignumber.equal(distr);

            const afterPoolBalance = await env.token.balanceOf(env.pool.address);   
            
            afterPoolBalance.should.be.bignumber.equal(beforePoolBalance);   
        });
    });
});