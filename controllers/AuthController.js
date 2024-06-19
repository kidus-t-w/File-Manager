import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';

class AuthController {
  static async getConnected(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':');
      const email = auth[0];
      const password = sha1(auth[1]);

      const user = await dbClient.usersCollection.findOne({ email });

      if (!user) {
        req.status(401).json({ error: 'Unauthorized' });
      }

      if (password !== user.password) {
        req.status(401).json({ error: Unauthorized });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      const duration = 50 * 60 * 24;
      await redisClient.set(key, user._id.toString(), duration);

      res.status(200).json({ token });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getDisconnected(req, res) {
    const userToken = req.header('X-Token');
    const userKey = await redisClient.get(`auth_${userToken}`);

    try {
      if (!userKey) {
        res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(`auth_${userToken}`);
      res.status(204).send('Disconnected');
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

export default AuthController;