/**
 * Script that add distribution from csv file to pool contract
 * Script expect three parameters.
 * @param rpc url.
 * @param pool address
 * @param Path to csv file with beneficiaries.
 *
 */

// const HttpProvider = require('ethjs-provider-http');
// const EthContract = require('ethjs-contract');
// const eth = new Eth(new HttpProvider(process.argv[2]));
// const contract = new EthContract(eth);
const  { mapArgPool }  = require('../test/helpers/argMapper.js');
const fs = require('fs');
const abi = JSON.parse(fs.readFileSync("./build/contracts/PlatinPool.json")).abi;
const byteCode = JSON.parse(fs.readFileSync("./build/contracts/PlatinPool.json")).bytecode;
const Eth = require('ethjs-query');
const { providers, Wallet, Contract, utils } = require('ethers');
const mnemonic = JSON.parse(fs.readFileSync('secrets.json', 'utf8')).mnemonic;
const privider = new providers.JsonRpcProvider( process.argv[2]);
const mnemonicWallet = new Wallet.fromMnemonic(mnemonic);
const wallet = new Wallet(mnemonicWallet.privateKey, privider);
const thread = require("./sleep.js");

fillInPools();

async function fillInPools() {
    let pools = mapArgPool(process.argv.slice(3));
    for (const [poolAddress, users] of pools.entries()) {
        try {
            await distribute(poolAddress, users);
        } catch(ex) {
            console.error(ex);
            process.exit(-1);
        }
    }
}

async function distribute(poolAddress, users) {
    // let accounts = await eth.accounts();
    // const Pool = contract(abi, byteCode, {
    //     from: accounts[0],
    //     gas: 600000,
    // });
    // let poolInstance = Pool.at(poolAddress);
    const poolInstance = new Contract(poolAddress, abi, wallet);
    for (const user of users) {
        try {
            await poolInstance.addDistribution(user.address, user.tokens, user.lockupsT, user.lockupsA, user.refundable);
            if (user.lockupsT.length > 0)
                console.log("Add distribution was successful. User: " + user.address + " tokens: " + user.tokens + " lockups time: " + user.lockupsT + " lockups amount: " + user.lockupsA);
            else
                console.log("Add distribution was successful. User: " + user.address + " tokens: " + user.tokens);
        } catch (ex) {
            console.log("-------------------------------------------------------------------------------------------------------------");
            console.error("Adding distribution for user: " + user.address + " was not successful. Stopping script.");
            console.log("-------------------------------------------------------------------------------------------------------------");
            throw ex;
        }
        thread.sleep(20000);
    }
}
