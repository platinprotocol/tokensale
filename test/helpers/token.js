function token (n) {
  return new web3.BigNumber(web3.fromWei(n, 'ether'));
}

module.exports = {
  token,
};