/**
 * Script that execute allocate function on TGE.
 * Script expect two parameters.
 * @param rpc url.
 * @param tge address
 *
 */

const fs = require('fs');
const abi = JSON.parse(fs.readFileSync("./build/contracts/PlatinTGE.json")).abi;
const byteCode = JSON.parse(fs.readFileSync("./build/contracts/PlatinTGE.json")).bytecode;
const HttpProvider = require('ethjs-provider-http');
const EthContract = require('ethjs-contract');
const Eth = require('ethjs-query');
const eth = new Eth(new HttpProvider(process.argv[2]));
const contract = new EthContract(eth);
const { isAddress } = require('web3-utils');

allocate();

async function allocate() {
    try {
        let tgeAddress = process.argv[3];
        if (!isAddress(tgeAddress))
            throw "TGE address: " + tgeAddress + " is not valid";

        let accounts = await eth.accounts();
        const TGE = contract(abi, byteCode, {
            from: accounts[0],
            gas: 3000000,
        });

        let tgeInstance = TGE.at(tgeAddress);
        let tx = await tgeInstance.allocate();
        console.log("Allocate function was executed. Transaction hash: " + tx);
    } catch(ex) {
        console.error(ex);
        process.exit(-1);
    }
}