import { isBefore } from 'date-fns';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Notification from '../schemas/Notification';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

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

    if (meetups.length) {
      return res
        .status(401)
        .json({ error: 'You already have a meetup scheduled for this hour.' });
    }

    const alreadySubscribed = await Subscription.findAll({
      where: { meetup_id, user_id: req.userId },
    });

    if (alreadySubscribed.length) {
      return res.status(401).json({
        error: "You can't subscribe to the same meetup more then once.",
      });
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId);

    /**
     * Notify organizer that somone has subscribed to meeetup
     */
    await Notification.create({
      content: `${user.name} has subscribed to your meetup ${meetup.name}!`,
      user: meetup.organizer_id,
    });

    /**
     * Notify organizer via email
     */
    Queue.add(SubscriptionMail.key, { meetup, user });

    return res.json(subscription);
  }

  // Unsubscribe
  async delete(req, res) {
    const { meetup_id } = req.params;

    const subscription = await Subscription.findOne({
      where: { user_id: req.userId, meetup_id },
    });

    if (!subscription) {
      return res
        .status(401)
        .json({ error: 'You are not subscribed to this meetup.' });
    }

    await subscription.destroy();

    return res.json({ message: 'You unsubscribed this meetup.' });
  }
}

export default new SubscriptionController();
