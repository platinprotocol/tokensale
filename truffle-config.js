const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');

let secrets;

if (fs.existsSync('secrets.json')) {
    secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
} else {
    throw new Error('No secrets.json found!');
}

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8555,
            network_id: '*',
            gas: 0x7a1200, // 8,000,000
            gasPrice: 2000000000 // 20 Gwei            
        },
        coverage: {
            host: "localhost",
            port: 8555,
            network_id: "*",            
            gas: 0xfffffffffff, 
            gasPrice: 0x01      
        },
        ropsten: {
            provider: () => new HDWalletProvider(secrets.mnemonic, 'https://rbst1.betex.io/'),
            network_id: 3,
            gas: 6700000,
            gasPrice: 90000000000 // 50 Gwei
        },
        rinkeby: {
            provider: () => new HDWalletProvider(secrets.mnemonic, 'https://rinkeby.infura.io/' + secrets.infuraApiKey),
            network_id: 4,
            gas: 6700000,
            gasPrice: 5000000000 // 5 Gwei
        },
        mainnet: {
            provider: () => new HDWalletProvider(secrets.mnemonic, 'https://mainnet.infura.io/' + secrets.infuraApiKey),
            network_id: 1,
            gas: 8000000,
            gasPrice: 20000000000 // 20 Gwei
        }
    },
    mocha: {
        enableTimeouts: false
    },
    secrets: secrets
};