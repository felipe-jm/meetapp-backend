import * as Yup from 'yup';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Avatar from '../models/Avatar';
import Banner from '../models/Banner';

class MeetupController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const meetups = await Meetup.findAll({
      where: { organizer_id: req.userId, canceled_at: null },
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

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      date: Yup.date().required(),
      location: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'validation fails.' });
    }

    const { name, description, date, location } = req.body;

    const meetup = await Meetup.create({
      name,
      description,
      date,
      location,
      organizer_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      description: Yup.string(),
      date: Yup.date(),
      location: Yup.string(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'validation fails.' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.organizer_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only organizers can edit their events.' });
    }

    const {
      name,
      description,
      date,
      location,
      organizer_id,
      banner_id,
    } = await meetup.update(req.body);

    return res.json({
      name,
      description,
      date,
      location,
      organizer_id,
      banner_id,
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name'],
        },
        {
          model: Banner,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (meetup.organizer_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to cancel this meetup." });
    }

    meetup.canceled_at = new Date();

    await meetup.save(meetup);

    return res.json('Meetup was cancelled. :c');
  }
}

export default new MeetupController();
