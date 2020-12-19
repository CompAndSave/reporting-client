const redis = require("redis");
const EventEmitter = require("events").EventEmitter;

// This class is to control the async api requests and responses from worker
// Using Redis to save the shared variable which can work across multiple instances of Lambda
//
// Status:
// - pending (waiting for the api response)
// - done (200 repsonse)
// - JSON.stringified message (non 200 reponse)
//
// Note:
// EventEmitter may not work well at Lambda due to possible multiple instances.
// Not recommend to use event as logic decision at Lambda
//
class AsyncApi {
  constructor() {}

  static async initialize(redisUrl, prefix, size = 5) {
    AsyncApi.size = size;
    AsyncApi.client = redis.createClient({
      url: redisUrl,
      prefix: prefix
    });
    AsyncApi.client.on("error", (error) => console.error(error));
    AsyncApi.emitter = new EventEmitter();
    AsyncApi.emitter
      .on("setDone", (id) => console.log(`Process ${id} is set done`))

    // if queue size and count were initialized already, skip the initialization
    //
    if (await AsyncApi.getSize() != size) { await AsyncApi.initializeRedis(); }
  }

  static close() { AsyncApi.client.quit(); }
  static async initializeRedis() { return await Promise.all([AsyncApi.setCount(0), AsyncApi.setSize(AsyncApi.size)]); }

  static async getSize() {
    let size = await AsyncApi.getRedis("QUEUE_SIZE");
    if (size === null) { await AsyncApi.initializeRedis(); }
    return Promise.resolve(size === null ? AsyncApi.size : size);
  }
  static async getCount() {
    let size = await AsyncApi.getRedis("QUEUE_COUNT");
    if (size === null) { await AsyncApi.initializeRedis(); }
    return Promise.resolve(size === null ? 0 : size);
  }
  static async setSize(value) { return Promise.resolve(await AsyncApi.setRedis("QUEUE_SIZE", value)); }
  static async setCount(value) { return Promise.resolve(await AsyncApi.setRedis("QUEUE_COUNT", value)); }
  
  static async up1Count() {
    let count = await AsyncApi.getCount();
    return Promise.resolve(await AsyncApi.setCount(++count));
  }

  static async down1Count() {
    let count = await AsyncApi.getCount();
    return Promise.resolve(await AsyncApi.setCount(--count));
  }

  static async isFullQueue() {
    let [count, size] = await Promise.all([AsyncApi.getCount(), AsyncApi.getSize()]);
    return Promise.resolve(count >= size);
  }

  // addRequest() and setRequest() are needed to be used together
  // addRequest is used before calling api, it is for check if queue is full and increase the queue count
  // setRequest will be used to store the messageId return from the api call.
  //
  static async setRequest(key) { return Promise.resolve(await AsyncApi.setRedis(key, "pending")); }
  static async addRequest() {
    if (await AsyncApi.isFullQueue()) { return Promise.reject(`no-of-request-is-at-limit`); }
    return Promise.resolve(await AsyncApi.up1Count()); 
  }

  // return 0 if no record fonund, or 1
  //
  static async removeRequest(id) {
    let result = 0, isDone = await AsyncApi.checkDone(id);

    if (isDone !== null) {
      result = await AsyncApi.delRedis(id);

      // if isDone, Count has been reduced by setDone()
      //
      if (result == 1 && !isDone) { await AsyncApi.down1Count(); }
    }

    return Promise.resolve(result);
  }

  static async setDone(id, response) {
    let result = await AsyncApi.setRedis(id, response);
    AsyncApi.emitter.emit("setDone", id);

    // Process won't count the limit after it is set done. But it is better to remove it if it is no longer needed
    //
    await AsyncApi.down1Count();

    return Promise.resolve(result);
  }

  // return null if no record is found,
  // otherwise false when value is "pending" or value of matching key.
  //
  static async checkDone(id) {
    let result = await AsyncApi.getRedis(id);
    return Promise.resolve(result === "pending" ? false : result);
  }
  

  ///////////////////////// Shared Redis operation functions below /////////////////////////////////////
  //
  // Use for set value by key at Redis
  //
  static async setRedis(key, value) {
    let error, result = new Promise((resolve, reject) => {
      AsyncApi.client.set(key, value, (err, res) => {
        if (err) { reject(err); }
        else { resolve(res); }
      });
    });

    result = await result.catch(err => error = err);
    if (error) { return Promise.reject(error); }

    return Promise.resolve(result);
  }

  // Use for get value by key at Redis
  //
  static async getRedis(key) {
    let error, result = new Promise((resolve, reject) => {
      AsyncApi.client.get(key, (err, res) => {
        if (err) { reject(err); }
        else { resolve(res); }
      });
    });

    result = await result.catch(err => error = err);
    if (error) { return Promise.reject(error); }

    return Promise.resolve(result);
  }

  // Use for del key/value at Redis
  //
  static async delRedis(key) {
    let error, result = new Promise((resolve, reject) => {
      AsyncApi.client.del(key, (err, res) => {
        if (err) { reject(err); }
        else { resolve(res); }
      });
    });

    result = await result.catch(err => error = err);
    if (error) { return Promise.reject(error); }

    return Promise.resolve(result);
  }
}

module.exports = AsyncApi;