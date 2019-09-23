import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Avatar from '../models/Avatar';
import Banner from '../models/Banner';

class MeetupController {
  async index(req, res) {
    const { page = 1, date } = req.query;

    const parsedDate = parseISO(date);

    const meetups = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'description', 'date', 'location'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
          include: [
            {
              model: Avatar,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Banner,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (meetups.length) {
      return res.json(meetups);
    }

    return res.json({ message: 'No meetups registered for this date.' });
  }
}

export default new MeetupController();
