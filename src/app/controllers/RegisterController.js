import { isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Registration from '../models/Registration';
import Mail from '../../lib/Mail';

class RegisterController {
  async store(req, res) {
    const { meetupID } = req.params;

    const meetup = await Meetup.findByPk(meetupID, {
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
    });
    if (!meetup) {
      return res.status(400).json({ error: 'no meetup has been founded' });
    }
    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'Organizer does not permitted to registrate' });
    }

    if (isBefore(meetup.datetime, new Date())) {
      return res.status(400).json({ error: 'This meetup already happened' });
    }
    const userRegistration = await Registration.findAll({
      where: { user_id: req.userId },
      include: {
        model: Meetup,
        as: 'meetup',
        attributes: ['datetime'],
      },
    });
    if (
      userRegistration.some(regist => regist.meetup_id === Number(meetupID))
    ) {
      return res.status(401).json({ error: 'you aready registered' });
    }
    // if (
    //   userRegistration.some(
    //     async regist => (await regist.meetup.datetime) === meetup.datetime
    //   )
    // ) {
    //   return res
    //     .status(401)
    //     .json({ error: 'You are registered on meetup with same date' });
    // }
    const newRegistration = await Registration.create({
      meetup_id: meetup.id,
      organizer_id: meetup.user_id,
      user_id: req.userId,
    });
    const user = await User.findByPk(req.userId);

    await Mail.sendmail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: '[Meetapp] Nova inscrição no meetup',
      template: 'cancelation',
      context: {
        provider: meetup.user.name,
        user: user.name,
        date: meetup.datetime,
      },
    });
    return res.json(newRegistration);
  }
}

export default new RegisterController();
