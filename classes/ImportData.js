const axios = require('axios');
const { timer } = require('cas-common-lib');
const AsyncApiQueue = require('async-api-queue');

class ImportData {
  constructor() {}

  // ----------- For Hosted Setting ----------------//
  //
  static async hostedImport(data) {
    let error, result = await axios({
      url: ImportData.apiUrl + 'import',
      method: "post",
      data: data
    }).catch(err => error = err);

    if (typeof error !== "undefined") { return Promise.reject(error); }

    return Promise.resolve(result);
  }
  // ------------------------------------------------//

  // ----------- For Serverless Setting ----------------//
  //
  static async serverlessImport(data, accessToken) {
    let error;
    await AsyncApiQueue.addRequest().catch(err => error = err);
    if (error) { return Promise.reject(error); }
  
    let result = await axios({
      url: ImportData.apiUrl + 'import',
      method: "post",
      data: data,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  
    let messageId = result.data.match(/<MessageId>(.*)<\/MessageId>/);
    if (!messageId) { return Promise.reject({ message: "missing-<MessageId>-tag-at-response-message", stack: result.data }); }
  
    await AsyncApiQueue.setRequest(messageId[1]);
    return Promise.resolve(messageId[1]);
  }

  static async getStatus(id, wait, checkTimeRange, maxTimeout) {
    let done = false, ts = new Date();

    do {
      done = await AsyncApiQueue.checkDone(id);
      if (done === null) { break; }
      if (!done) { await timer.timeout(checkTimeRange); }
    } while (wait && !done && (new Date() - ts) < maxTimeout);

    if (done) { await AsyncApiQueue.removeRequest(id); }

    let status, message;
    switch (done) {
      case false:
        status = "pending";
        break;
      case null:
        status = "not found";
        break;
      default:
        message = JSON.parse(done);
        status = message.httpStatus == 200 ? "done" : "error";
    }

    return Promise.resolve({
      status: status,
      message: message && message.response ? JSON.stringify(message.response) : undefined
    });
  }
  // ------------------------------------------------//
}

module.exports = ImportData;