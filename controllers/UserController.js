import sha1 from 'sha1';
import dbClient from '../utils/db';

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
}

export default UsersController;
