/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

module.exports = async function(env, _tge) {
    const tge = typeof _tge === 'undefined' ? env.tge : _tge;

    await env.token.setTGE(tge.address).should.be.fulfilled;
    await env.ico.setTGE(tge.address).should.be.fulfilled;

    await tge.allocate().should.be.fulfilled;
};
