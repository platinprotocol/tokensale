const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

module.exports = async function(env) {
    await env.token.setTGE(env.tge.address).should.be.fulfilled;;
    await env.preIco.setTGE(env.tge.address).should.be.fulfilled;;
    await env.ico.setTGE(env.tge.address).should.be.fulfilled;;
    await env.ppp.setTGE(env.tge.address).should.be.fulfilled;;

    await env.tge.allocate().should.be.fulfilled;;
};
