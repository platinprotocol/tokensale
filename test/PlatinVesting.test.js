const { increaseTimeTo, duration } = require('./helpers/increaseTime');
const { latestTime } = require('./helpers/latestTime');
const { advanceBlock } = require('./helpers/advanceToBlock');
const { EVMRevert } = require('./helpers/EVMRevert');

const PlatinVesting = artifacts.require('PlatinVesting');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PlatinVesting', () => {

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
        await advanceBlock();
    }); 

    beforeEach(async () => {
        this.startTime = (await latestTime()) + duration.hours(1);
        this.firstRelease = this.startTime + duration.hours(1);
        this.secondRelease = this.startTime + duration.hours(2);
        this.thirdRelease = this.startTime + duration.hours(3);
        this.vesting = await PlatinVesting.new(3, 
            [this.firstRelease, 
             this.secondRelease,
             this.thirdRelease
            ]
        );
    });

    it('should not be able instantiate with zero parts', async() => {
        await PlatinVesting.new(0, [this.firstRelease]).should.be.rejectedWith(EVMRevert);   
    });

    it('should not be able instantiate with releases count not equal releases parts', async() => {
        await PlatinVesting.new(1, [this.firstRelease, this.secondRelease]).should.be.rejectedWith(EVMRevert);   
    });    

    it('sholud be calc vested balance according vesting', async() => {
        const balance = new BigNumber(550);

        const startExpected = balance;
        const firstExpected = balance.sub(balance.dividedToIntegerBy(3));
        const secondExpected = balance.sub(balance.dividedToIntegerBy(3).mul(2));
        const thirdExpected = 0;

        const startActual = await this.vesting.balanceVested(balance);
        await increaseTimeTo(this.firstRelease);
        const firstActual = await this.vesting.balanceVested(balance);
        await increaseTimeTo(this.secondRelease);
        const secondActual = await this.vesting.balanceVested(balance);
        await increaseTimeTo(this.thirdRelease);
        const thirdActual = await this.vesting.balanceVested(balance); 

        startExpected.should.be.bignumber.equal(startActual);
        firstExpected.should.be.bignumber.equal(firstActual);
        secondExpected.should.be.bignumber.equal(secondActual);
        thirdExpected.should.be.bignumber.equal(thirdActual);
    });
});