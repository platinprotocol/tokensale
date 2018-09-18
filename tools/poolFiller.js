const  { mapArgPool }  = require('../test/helpers/argMapper.js');
const fs = require('fs');
const abi = JSON.parse(fs.readFileSync("./build/contracts/PlatinPool.json")).abi;
const byteCode = JSON.parse(fs.readFileSync("./build/contracts/PlatinPool.json")).bytecode;
const HttpProvider = require('ethjs-provider-http');
const EthContract = require('ethjs-contract');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider(process.argv[2]));
const contract = new EthContract(eth);

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
    let accounts = await eth.accounts();
    const Pool = contract(abi, byteCode, {
        from: accounts[0],
        gas: 600000,
    });
    let poolInstance = Pool.at(poolAddress);
    for (const user of users) {
        try {
            await poolInstance.addDistribution(user.address, user.tokens, user.lockups, user.refundable);
            console.log("Add distribution was successful. User: " + user.address + " tokens: " + user.tokens);
        } catch (ex) {
            console.error("Adding distribution for user: " + user.address + " was not successful. Stopping script.");
            throw ex;
        }
    }
}
