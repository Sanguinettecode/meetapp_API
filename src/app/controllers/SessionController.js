import JWT from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    const userExist = await User.findOne({ where: { email } });
    if (!userExist) {
      return res.status(401).json({ error: 'User does not found' });
    }
    if (!(await userExist.checkPassword(password))) {
      res.status(401).json({ error: 'User does not have authorization' });
    }
    const { id, name } = userExist;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: JWT.sign({ id }, authConfig.AUTH_SECRETE, {
        expiresIn: authConfig.AUTH_EXPIRESIN,
      }),
    });
  }
}

export default new SessionController();
