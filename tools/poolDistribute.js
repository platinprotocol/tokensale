/**
 * Script that distribute all beneficiaries in pool contract.
 * Script expect two parameters.
 * @param rpc url.
 * @param pool address
 *
 */

const fs = require('fs');
const abiTGE = JSON.parse(fs.readFileSync("./build/contracts/PlatinTGE.json")).abi;
const byteCodeTGE = JSON.parse(fs.readFileSync("./build/contracts/PlatinTGE.json")).bytecode;
const abi = JSON.parse(fs.readFileSync("./build/contracts/PlatinPool.json")).abi;
const byteCode = JSON.parse(fs.readFileSync("./build/contracts/PlatinPool.json")).bytecode;
const HttpProvider = require('ethjs-provider-http');
const EthContract = require('ethjs-contract');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider(process.argv[2]));
const contract = new EthContract(eth);
const { isAddress } = require('web3-utils');

fillInPools();

async function fillInPools() {

    try {
        let poolAddress = process.argv[3];
        if (!isAddress(poolAddress))
            throw "Pool address: " + poolAddress + " is not valid";

        await distribute(poolAddress);
    } catch(ex) {
        console.error(ex);
        process.exit(-1);
    }
}

async function distribute(poolAddress) {
    let accounts = await eth.accounts();
    const TGE = contract(abiTGE, byteCodeTGE, {
        from: accounts[0],
        gas: 3000000,
    });

    const Pool = contract(abi, byteCode, {
        from: accounts[0],
        gas: 600000,
    });
    let poolInstance = Pool.at(poolAddress);
    const membersAmount = (await poolInstance.membersCount())[0];
    console.log("Members amount: " + membersAmount);
    for (let i = 0; i < membersAmount.toNumber(); i++) {
        try {
            let beneficiary = (await poolInstance.members(i))[0];
            await poolInstance.distribute(beneficiary);
            console.log("Distributing was successful. Beneficiary: " + beneficiary + " Index: " + i);
        } catch (ex) {
            console.error("Distributing was not successful. Beneficiary index: " + i +".");
        }
    }
}
