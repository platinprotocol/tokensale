module.exports = {
    port: 8555,
    norpc: true,
    testrpcOptions: "--port 8555 --gasLimit 0xfffffffffff",
    skipFiles: [
        'Migrations.sol',
        'mocks'
    ],
    copyPackages: ['openzeppelin-solidity']
};