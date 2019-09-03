import { isBefore } from 'date-fns';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          order: ['date'],
        },
      ],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const { meetup_id } = req.params;

    const meetup = await Meetup.findByPk(meetup_id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!meetup) {
      return res.json({ error: 'No meetup registered with this id.' });
    }

    if (meetup.organizer_id === req.userId) {
      return res
        .status(401)
        .json({ error: "Organizers can't subscribe to their own meetup." });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({
        error: 'Meetup already happened.',
      });
    }

    const meetups = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'date'],
          where: { date: meetup.date },
        },
      ],
    });

    if (meetups.length > 0) {
      return res
        .status(401)
        .json({ error: 'You already have a meetup scheduled for this hour.' });
    }

    const alreadySubscribed = await Subscription.findAll({
      where: { meetup_id, user_id: req.userId },
    });

    if (alreadySubscribed.length > 0) {
      return res.status(401).json({
        error: "You can't subscribe to the same meetup more then once.",
      });
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId);

    await Mail.sendMail({
      to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
      subject: `Novo usuário inscrito no Meetup ${meetup.name}`,
      template: 'subscription',
      context: {
        organizer: meetup.organizer.name,
        name: user.name,
        email: user.email,
      },
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
