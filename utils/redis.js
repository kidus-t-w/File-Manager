import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Class for preforming connection with redis.
 */
class RedisClient {
  constructor() {
    this.client = createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);

    this.client.on('error', (error) => {
      console.log(`Redis Client not connected to the server: ${error.message}`);
    });
  }

  /**
   * Check if connection is alive
   * @return { boolean } returns true if connections is alive else returns false
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets value of the desired key.
   * @param {string} key key of the value to be returned
   * @returns the value associated to the key.
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * Creates a new key with a specific TTL
   * @param {string} key key to be saved in redis
   * @param {string} value value to be assigned to key
   * @param {number} duration TTL of key
   * @returns {undefined} No return
   */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
   *
   * @param {string} key key to be deleted form redis.
   * @return {undefined} No return
   */
  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
