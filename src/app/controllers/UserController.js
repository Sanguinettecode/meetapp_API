import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
    });
    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation failed' });
    }
    const userExist = await User.findOne({ where: { email: req.body.email } });
    if (userExist) {
      res.status(400).json({ error: 'User email already exist' });
    }
    const { id, name, email } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldpassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldpassword', (oldpassword, field) =>
          oldpassword ? field.required() : field
        ),
      confirmpassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    if (!(await schema.isValid(req.body))) {
      res.status(400).json({ error: 'Validation failed' });
    }

    const { email, oldpassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (user) {
      if (email && email !== user.email) {
        const userExist = await User.findOne({ where: { email } });
        if (userExist) {
          res.status(400).json({ error: 'User email already exist' });
        }
      }
      if (oldpassword && !(await user.checkPassword(oldpassword))) {
        return res.status(401).json({ error: 'This password does not match' });
      }

      const newUser = await user.update(req.body);
      return res.json(newUser);
    }
    return res.status(401).json({ error: 'User does not find' });
  }
}

export default new UserController();
