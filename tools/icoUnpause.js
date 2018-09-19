/**
 * Script that resume ico contract.
 * Script expect two parameters.
 * @param rpc url.
 * @param ico address
 *
 */

const fs = require('fs');
const abi = JSON.parse(fs.readFileSync("./build/contracts/PlatinICO.json")).abi;
const byteCode = JSON.parse(fs.readFileSync("./build/contracts/PlatinICO.json")).bytecode;
const HttpProvider = require('ethjs-provider-http');
const EthContract = require('ethjs-contract');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider(process.argv[2]));
const contract = new EthContract(eth);
const { isAddress } = require('web3-utils');

resume();

async function resume() {
    try {
        let icoAddress = process.argv[3];
        if (!isAddress(icoAddress))
            throw "ICO address: " + icoAddress + " is not valid";

        let accounts = await eth.accounts();
        const ICO = contract(abi, byteCode, {
            from: accounts[0],
            gas: 3000000,
        });

        let icoInstance = ICO.at(icoAddress);
        let rc = await icoInstance.unpause();
        console.log("ICO was resumed. Resume transaction hash: " + rc);
    } catch(ex) {
        console.error(ex);
        process.exit(-1);
    }
}