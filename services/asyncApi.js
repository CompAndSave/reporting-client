const AsyncApiQueue = require('async-api-queue');

async function worker(message) {
  let result = await AsyncApiQueue.setDone(JSON.parse(message).id, message);
  return Promise.resolve(result);
}

module.exports = { worker };