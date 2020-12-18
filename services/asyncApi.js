const AsyncApi = require('../classes/AsyncApi');

async function worker(message) {
  let result = await AsyncApi.setDone(JSON.parse(message).id, message);
  return Promise.resolve(result);
}

module.exports = { worker };