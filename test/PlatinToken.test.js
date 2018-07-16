const PlatinStandardVesting = artifacts.require('PlatinStandardVesting');
const PlatinToken = artifacts.require('PlatinToken');
const PlatinTGE = artifacts.require('PlatinTGE');
const PlatinICO = artifacts.require('PlatinICO');

const assertRevert = require('./helpers/assertRevert');
const expectThrow = require('./helpers/expectThrow');
const increaseTimeTo = require('./helpers/increaseTime');
const latestTime = require('./helpers/latestTime');
const ether = require('./helpers/ether');
const setup = require('./helpers/setup');


contract('PlatinToken', (accounts) => {
    const nullAddress  = '0x0000000000000000000000000000000000000000';

    let env = {};

    beforeEach(async () => {
        await setup(accounts, env);
    });

    it('should set TGE', async() => {
        await env.token.setTGE(env.tge.address);

        const tgeActual = await env.token.tge.call();
        assert.equal(tgeActual, env.tge.address, "TGE addresses don't match");
    });

    it('should set ICO', async() => {
        await env.token.setICO(env.ico.address);

        const icoActual = await env.token.ico.call();
        assert.equal(icoActual, env.ico.address, "ICO addresses don't match");
    });

    
    it('should be able to allocate tokens during TGE', async() => {
        const tgeAddress = accounts[1];
        const to = accounts[2];
        const amount = 10000000;

        await env.token.setTGE(tgeAddress);

        const totalSupplyBefore = await env.token.totalSupply();
        const balanceBefore = await env.token.balanceOf(to);

        await env.token.allocate(to, amount, nullAddress, {from: tgeAddress});

        const totalSupplyAfter = await env.token.totalSupply();
        const balanceAfter = await env.token.balanceOf(to);

        const totalSupplyDiff = totalSupplyAfter.sub(totalSupplyBefore);
        const balanceDiff = balanceAfter.sub(balanceBefore);

        assert.equal(totalSupplyDiff.toNumber(), amount);
        assert.equal(balanceDiff.toNumber(), amount);
    });

    it('should be able to lock up transfers', async () => {
        const icoAddress = accounts[1];
        const to = accounts[2];
        const firstPortion = 10000000;
        const secondPortion = 20000000;

        await env.token.setICO(icoAddress);

        await env.token.lockup(to, firstPortion, { from: icoAddress });
        const firstBalance = await env.token.lockedup.call(to);

        await env.token.lockup(to, secondPortion, { from: icoAddress });
        const secondBalance = await env.token.lockedup.call(to);

        assert.equal(firstBalance.toNumber(), firstPortion);
        assert.equal(secondBalance.toNumber(), firstPortion + secondPortion);
    });

});