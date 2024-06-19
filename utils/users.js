async function getIdAndKey(request) {
      const userToken = request.headers('X-Token');
      const authKey = `auth_${userToken}`;
      const userID = await redisClient.get(authKey);
      console.log('USER KEY GET ME', userID);

      if (!userID) {
        response.status(401).json({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUser({ _id: ObjectId(userID) });
      return userID
    }

// async function isValidUser {
//   pass
// }

export default {getIdAndKey};