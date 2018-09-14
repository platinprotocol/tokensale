# Platin PTNX Token Contracts

## Platin PTNX Token Contracts are:

1. PlatinTGE contract. The Token Generation Event (TGE) contract. It holds all token economic constants and makes the initial token allocation according to the token supply distribution table. Initial token allocation function should be called outside the blockchain at the TGE moment of time, from here on out, Platin contracts become functional.
2. PlatinToken contract. The ERC20 Token contract with additional capabilities as follows:
- Holders List. Contract tracks token holders by itself. Note that the list of holders consists holders with the non-zero balance only.
- Lockup. A token holder can have locked up (till some release time) amounts on his balance, each locked up amount have it's own release time. Untill release time locked up amount can't be transfered from the balance. Lockups can be refundable. In case of refund previous holder can get back locked up tokens. Only still locked up amounts can be transfered back. Lokups is placed using special tranfer functions transferWithLockup and transferFromWithLockup. Only authorized holders can do transfers with lockups.
3. PlatinICO contract. Platin public sales contract. It has start and end date and finalization functionality. Before purchase customers should be whitelisted during KYC/AML procedure. Tokens can be purchased with and without lockup. Locked up tokens purchase has special token rate. When ICO ends, unsold tokens are distributed to the unsold token reserve with lockup. All constants for processing purchases and for the finalization are stored in the TGE contract.
4. PlatinICOLockup and PlatinICORegular. Proxy contracts that receives ether directly and sends it to the PlatinICO contract calling appropriate buying function.
5. PlatinPool contract. This contract is developed to distribute tokens (with/without lockups) according to the distribution table. Only authorized addresess can add distribution records to the pool and call refund for the distributed and lockuped (with refundable feature) amounts. But distribution itself can be invoked publically. This contract is used to create PreIco, Founders and Advisors pools and can be used to create pools in the future. 
6. AdvisorsPool, FoundersPool and PreIcoPool contracts. PlatinPool contracts that get it's supplies during initial token allocation, holds distribution tables for advisors, founders and pre ico supplies and provide distribution capability for that supplies.


## Auxiliary contracts:

1. HoldersToken contract. The extension to the OpenZepellin's StandardToken contract to track token holders. It is used by the PlatinToken contract.
2. Authorizable contract. Authorizable contract holds a list of addresses that authorized to do smth. It is used by the PlatinToken to authorize transfers with lockup and by the PlatinPool contract to authorize adding of distribution records and refund.


## Mocks:

1. Mock contracts were created for the test purposes and they are not subjects for the audit.

## Secrets:

1. After clone this repo and before use the truffle please create the file `secrets.json` in the code root with two fields `mnemonic` and `infuraApiKey` in it, example:
```
{
  "mnemonic": "lounge sting unhappy dwarf melody ocean review charge coconut maze grab leopard",
  "infuraApiKey": "O1LEERP0UrL6fjxHRpSr"
}
```

## Notes:

1. We use duplicated code blocks for the constructor with token (PlatinPreICO, PlatinPayoutProgram) and to set TGE contract (PlatinToken, PlatinPreICO, PlatinICO, PlatinPayoutProgram) to avoid circular importing issues.
2. Due to the solidity inheritance limitations the code of OpenZeppelin's FinalizableCrowdsale contract is copied directly to the PlatinICO contract to use it's finalize feature.
3. Additional Token capabilities that tweak transfer functionality obviously increase the price for a token transfers. It's acceptable for the PTNX Token economic model.
4. In our tests we are based on a fact that Open Zeppelin had tested and audited their contracts we extended so we omited test duplication.
5. To run tests or migrations the truffle framework should be installed.
6. Before every run of the tests please (re)start the ganache-cli manually with the following parameters: 
```
./node_modules/.bin/ganache-cli -p 8545 --gasLimit 0x7a1200
```
7. To run test call 
```
npm run test
```
8. Before every run of the test coverage please (re)start the testrpc-sc manually with the following parameters: 
```
./node_modules/.bin/testrpc-sc -p 8555 --gasLimit 0xfffffffffff
```
9. To run test coverage call 
```
npm run coverage
```
