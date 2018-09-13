const AuthorizableMock = artifacts.require('AuthorizableMock');

const { EVMRevert } = require('./helpers/EVMRevert');
const { zeroAddress }  = require('./helpers/zeroAddress');


require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Authorizable', (accounts) => { 

    let env = {};

    beforeEach(async () => {
        env.auth = await AuthorizableMock.new();
    });

    it('should be able to authorize address', async() => {
        const targetAddress = accounts[1];
        await env.auth.authorize(targetAddress).should.be.fulfilled;        
    });

    it('should be able to unAthorize address', async() => {
        const targetAddress = accounts[1];
        await env.auth.authorize(targetAddress).should.be.fulfilled;  
        await env.auth.unAuthorize(targetAddress).should.be.fulfilled;       
    });    

    it('should be query authorized address', async() => {
        const targetAddress = accounts[1];
        await env.auth.authorize(targetAddress).should.be.fulfilled;     
        const isAuthorized = await env.auth.authorized(targetAddress);
        isAuthorized.should.be.equal(true);
    });

    it('should be able to authorize address by owner only', async() => {
        const targetAddress = accounts[2];
        const notOwner = accounts[1];
        await env.auth.authorize(targetAddress, { from: notOwner }).should.be.rejectedWith(EVMRevert);       
    });

    it('should be able to unAuthorize address by owner only', async() => {
        const targetAddress = accounts[2];
        const notOwner = accounts[1];
        await env.auth.unAuthorize(targetAddress, { from: notOwner }).should.be.rejectedWith(EVMRevert);       
    });

    it('should be able to call restricted function by owner', async() => {
        const targetAddress = accounts[1];
        await env.auth.authorize(targetAddress).should.be.fulfilled;    
        await env.auth.doSmth().should.be.fulfilled;   
    });    

    it('should be able to call restricted function by authorized address', async() => {
        const targetAddress = accounts[1];
        await env.auth.authorize(targetAddress).should.be.fulfilled;     
        await env.auth.doSmth({ from: targetAddress }).should.be.fulfilled;   
    });    

    it('should not be able to authorize zero address', async() => {
        await env.auth.authorize(zeroAddress).should.be.rejectedWith(EVMRevert);       
    });

    it('should not be able to unAuthorize zero address', async() => {
        await env.auth.unAuthorize(zeroAddress).should.be.rejectedWith(EVMRevert);       
    });    

    it('should be not able to authorize address twice', async() => {
        const targetAddress = accounts[1];
        await env.auth.authorize(targetAddress).should.be.fulfilled;        
        await env.auth.authorize(targetAddress).should.be.rejectedWith(EVMRevert);   
    });    

    it('should not be able to unAuthorize not authorized address', async() => {
        const targetAddress = accounts[1];
        await env.auth.unAuthorize(targetAddress).should.be.rejectedWith(EVMRevert);       
    });    

    
});
