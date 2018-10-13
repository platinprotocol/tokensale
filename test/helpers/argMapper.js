const { isAddress } = require('web3-utils');
var fs = require('fs');
const addressIndex = 0;
const tokensIndex = 1;
const refundableIndex = 2;
var ethers = require('ethers');
var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:" + 8545));
const BigNumber = web3.BigNumber;
var decimalPlaces = 18;

function mapArgPool(arg) {
    if (arg.length % 2 != 0)
        throw 'Invalid parameters path';

    var argArray = new Map();
    for (let i = 0; i < arg.length; i += 2) {
        if (!isAddress(arg[i]))
            throw "Address: " + arg[i] + " is not valid";

        if (!fs.existsSync(arg[i + 1]))
            throw "File: \'" + arg[i + 1] + "\' is not exist";

        argArray.set(arg[i], arg[i + 1]);
    }

    let result = new Map();
    for (const [key, value] of argArray.entries()) {
        let users = mapPoolFile(value);

        result.set(key, users);
    }

    return result;
}

function mapPoolFile(filePath) {
    if (!fs.existsSync(filePath))
        throw "File: \'" + filePath + "\' is not exist";

    let users = Array();

    let fileData = fs.readFileSync(filePath, "utf8");
    var rows = fileData.split('\n');
    for (let i = 0; i < rows.length; i++) {
        if (rows[i] === '')
            continue;
        let cells = rows[i].split(',');
        if (cells.length % 2 !== 1 && cells.length >= 3)
            throw "Row length: " + cells.length + " is not correct in file: " + filePath + " Row number: " + (i + 1);

        if (!isAddress(cells[addressIndex].toLowerCase()))
            throw "Address: " + cells[addressIndex] + " is not valid in row: " + (i + 1) + " file: " + filePath;

        if (Number.isInteger(cells[tokensIndex]))
            throw "Tokens amount: " + cells[tokensIndex] + " is not valid in row: " + (i + 1) + " file: " + filePath;

        if (cells[refundableIndex] !== '1' && cells[refundableIndex] !== '0')
            throw "Refundable: " + cells[refundableIndex] + " is not valid in row: " + (i + 1) + " file: " + filePath;

        let user = {};
        user.address = cells[addressIndex].toLowerCase();
        user.tokens = ethers.utils.parseUnits(cells[tokensIndex], decimalPlaces);
        user.refundable = !!+cells[refundableIndex];
        user.lockupsT = Array();
        user.lockupsA = Array();

        let totalLockup = new BigNumber(0);
        for (let j = 3; j < cells.length; j += 2) {
            if ((new Date(cells[j])).getTime() > 0)
                throw "Timestamp: " + cells[j] + " is not valid in row: " + (i + 1) + " file: " + filePath;
            if (Number.isInteger(cells[j + 1]))
                throw "Lock up tokens amount: " + cells[j + 1] + " is not valid in row: " + (i + 1) + " file: " + filePath;

            totalLockup = totalLockup.add(ethers.utils.parseUnits(cells[j + 1], decimalPlaces));

            user.lockupsT.push(cells[j]);
            user.lockupsA.push(ethers.utils.parseUnits(cells[j + 1], decimalPlaces));
        }

        if (totalLockup > user.tokens)
            throw "Lock up sum of tokens amount is more than amount row: " + (i + 1) + " file: " + filePath;


        users.push(user);
    }

    return users;
}

module.exports = {
    mapArgPool
};
