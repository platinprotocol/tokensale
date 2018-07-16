/**
 * Helper to wait for log emission.
 * @param  {Object} _event The event to wait for.
 */
module.exports = (_event) => {
    return new Promise((resolve, reject) => {
      _event.watch((error, log) => {
        _event.stopWatching();
        if (error !== null)
          reject(error);

        resolve(log);
      });
    });
}