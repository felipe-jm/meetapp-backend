import User from '../models/User';

class UserController {
  async store(req, res) {
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
}

export default new UserController();
