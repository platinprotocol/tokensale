# Platin PTNX Token Contracts

## Platin PTNX Token Contracts are:

1. PlatinTGE contract. The Token Generation Event (TGE) contract. It holds all token economic constants, addresses of all other contracts and makes the initial token allocation (with/without vesting) according to the token supply distribution table. Initial token allocation function should be called outside the blockchain at the TGE  moment of time, from here on out, Platin Token, preICO, ICO and PPP contracts become functional.
2. PlatinToken contract. The ERC20 Token contract with additional capabilities as follows:
- Holders List. Contract tracks token holders by itself. Note that the list of holders consists holders with the non-zero balances only.
- Vesting. A token holder can have vested amounts on his balance, each vested amount can be vested with it's own rules controlled by special Vesting contract. Still vested part of vested amount can't be transfered from the balance. Vesting contract should implement IVesting interface and should answer on the question "What part of the vested amount is still blocked for the transfers at this monent of time?".
- Lockup. A token holder can have locked up (till some release time) amounts on his balance, each locked up amount can have it's own release time. Untill release time locked up amount can't be transfered from the balance.
- Platin Payout Program (PPP) transfers. When ICO ends, unsold tokens are distributed to the unsold token holders (with/without vesting) and the Platin Payout Program (PPP) contract. A token holder can send tokens to this contract and than gets back multiplied token amount, but this amount will be locked up for the PPP lockup period of time. The multiplier and the PPP lockup period are stored as constants in the Platin TGE contract.
3. PlatinPreICO contract. This contract is developed to distribute tokens that are already sold during private preICO stage. Appropriate distribute* functions of the contract should be called outside the blockchain to distribute the preIco amount to the preIco token holders.
4. PlatinICO contract. Platin public sales contract. Before purchase customers should be whitelisted during KYC/AML procedure. Tokens can be purchased with and without lockup. Locked up tokens purchase has special token rate. When ICO ends, unsold tokens are distributed to the unsold token holders (with/without vesting) and the Platin Payout Program contract as a result of the contract finalization. All constants for processing purchases and for the finalization are stored in the Platin TGE contract.
5. PlatinPayoutProgram (PPP) contract. This contract holds a part of the unsold amount of tokens remaining from the ICO. A token holder can send tokens to this contract and than gets back multiplied token amount, but this amount will be locked up for the PPP lockup period of time. The multiplier and the PPP lockup period are stored as constants in the TGE contract.
6. PlatinStandardVesting. It is a widely used standard vesting contract: an amount become vested using 24 parts for 24 months, vesting starts from the TGE moment of time.
7. PlatinUnsoldVesting. This contract is used to make vesting for the unsold tokens holders during the ICO contract finalization: an amount become vested using 4 parts for 4 years, vesting starts from the end of the ICO.

## Auxiliary contracts:

1. HoldersToken contract. The extension to the OpenZepellin's StandardToken contract to track token holders. It is used by PlatinToken contract.
2. TokenLockup contract. The mixin for a ERC20 Token that gives possibility for token holders to have locked up (till release time) amounts of tokens on their balances. Token should check a balance spot for transfer and transferFrom functions to use this feature. It is used by PlatinToken contract.
3. TokenVesting contract. The mixin for a ERC20 Token that gives possibility for token holders to have vested amounts of tokens on their balances. Vesting rules are controlled by vesting contracts that should implement IVesting.sol interface contract. Token should check a balance spot for transfer and transferFrom functions to use this feature. It is used by PlatinToken contract.
4. IVesting contract. Vesting contracts interface. Every vesting contract should implemet this interface.
5. PlatinVesting contact. Platin standard implementation of the IVesting interface. It uses number of vesting parts and list of timestamps when the next part should be released. It is used by PlatinStandardVesting and PlatinUnsoldVesting contracts and can be used by any other vesting contract to implement the same vesting logic.

## Notes:

1. We use duplicated code blocks for the constructor with token (PlatinPreICO, PlatinPayoutProgram) and to set TGE contract (PlatinToken, PlatinPreICO, PlatinICO, PlatinPayoutProgram) to avoid circular importing issues.
2. Due to the solidity inheritance limitations the code of OpenZeppelin's FinalizableCrowdsale contract is copied directly to the PlatinICO contract to use it's finalize feature.
