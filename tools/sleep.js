function sleep(ms) {
    let start = Date.now();

    while (true) {
        let clock = (Date.now() - start);
        if (clock >= ms) break;
    }
}

module.exports = {
    sleep
};