import * as Yup from 'yup';
import { isBefore, parseISO, startOfHour } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      order: ['datetime'],
      attributes: ['id', 'title', 'description', 'datetime', 'locale'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });
    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      locale: Yup.string().required(),
      datetime: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const { title, description, locale, datetime } = req.body;

    const hourOfStart = startOfHour(parseISO(datetime));
    if (isBefore(hourOfStart, new Date())) {
      return res.status(400).json({ error: 'insert a valid date' });
    }
    const meetup = await Meetup.create({
      user_id: req.userId,
      title,
      description,
      locale,
      datetime,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Is needs you are authenticated user' });
    }
    const { meetupID } = req.params;
    const meetup = await Meetup.findOne({
      where: { id: meetupID, user_id: user.id },
    });
    if (!meetup) {
      return res
        .status(400)
        .json({ error: 'no meetup has been funded for this user' });
    }
    if (isBefore(meetup.datetime, new Date())) {
      return res
        .status(400)
        .json({ error: 'This meetup does not can be updated' });
    }
    const newDate = req.body.datetime;
    const hourOfNewStart = startOfHour(parseISO(newDate));
    if (newDate && isBefore(hourOfNewStart, new Date())) {
      return res.status(400).json({ error: 'insert a valid date' });
    }
    const {
      id,
      title,
      description,
      locale,
      datetime,
      banner,
    } = await meetup.update(req.body);
    return res.json({
      id,
      title,
      description,
      locale,
      datetime,
      banner,
    });
  }

  async delete(req, res) {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(401).json({ error: 'Is needs you are authenticated user' });
    }
    const { meetupID } = req.params;
    const meetup = await Meetup.findOne({
      where: { id: meetupID, user_id: user.id },
    });
    if (!meetup) {
      return res
        .status(400)
        .json({ error: 'no meetup has been funded for this user' });
    }
    if (isBefore(meetup.datetime, new Date())) {
      return res
        .status(400)
        .json({ error: 'This meetup does not can be canceled' });
    }
    await meetup.destroy();
    return res.json('Meetup has been deleted');
  }
}

export default new MeetupController();
