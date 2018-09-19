/**
 * Script that resume token contract.
 * Script expect two parameters.
 * @param rpc url.
 * @param token address
 *
 */

const fs = require('fs');
const abi = JSON.parse(fs.readFileSync("./build/contracts/PlatinToken.json")).abi;
const byteCode = JSON.parse(fs.readFileSync("./build/contracts/PlatinToken.json")).bytecode;
const HttpProvider = require('ethjs-provider-http');
const EthContract = require('ethjs-contract');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider(process.argv[2]));
const contract = new EthContract(eth);
const { isAddress } = require('web3-utils');

resume();

async function resume() {
    try {
        let tokenAddress = process.argv[3];
        if (!isAddress(tokenAddress))
            throw "Token address: " + tokenAddress + " is not valid";

        let accounts = await eth.accounts();
        const Token = contract(abi, byteCode, {
            from: accounts[0],
            gas: 3000000,
        });

        let tokenInstance = Token.at(tokenAddress);
        let rc = await tokenInstance.unpause();
        console.log("Token was resumed. Resumed transaction hash: " + rc);
    } catch(ex) {
        console.error(ex);
        process.exit(-1);
    }
}