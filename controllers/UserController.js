import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    // If email or password is missing
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
    }
    // Hashing password
    const hashedPassword = sha1(password);

    try {
      const collection = dbClient.usersCollection;
      const user = await collection.findOne({ email });

      // If user exists in db.
      if (user) {
        response.status(400).json({ error: 'Already exist' });
      } else {
        const userData = { email, password: hashedPassword };
        collection.insertOne(userData);
        const newUser = await collection.findOne(
          { email },
          { projection: { email: 1 } }
        );
        response.status(201).json({ id: newUser._id, email: newUser.email });
      }
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }

  static async getMe(request, response) {
    try {
      const userToken = request.headers('X-Token');
      const authKey = `auth_${userToken}`;
      const userID = await redisClient.get(authKey);
      console.log('USER KEY GET ME', userID);

      if (!userID) {
        response.status(401).json({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUser({ _id: ObjectId(userID) });
      // console.log('USER GET ME', user);
      response.json({ id: user._id, email: user.email });
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
