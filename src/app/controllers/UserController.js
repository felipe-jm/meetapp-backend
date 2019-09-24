import * as Yup from 'yup';
import User from '../models/User';
import Avatar from '../models/Avatar';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'This email is been used.' });
    }

    const { id, name, email, organizer } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      organizer,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'This email is been used.' });
      }

      return res.status(400).json({ error: 'Wrong email.' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res
        .status(401)
        .json({ error: 'That is not your current password.' });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findOne({
      where: { email },
      include: [
        {
          model: Avatar,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }
}

export default new UserController();
