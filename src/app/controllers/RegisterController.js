import { isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import Registration from '../models/Registration';

class RegisterController {
  async store(req, res) {
    const { meetupID } = req.params;

    const meetup = await Meetup.findByPk(meetupID);
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
    if (
      userRegistration.some(
        async regist => (await regist.meetup.datetime) === meetup.datetime
      )
    ) {
      return res
        .status(401)
        .json({ error: 'You are registered on meetup with same date' });
    }
    const newRegistration = await Registration.create({
      meetup_id: meetup.id,
      organizer_id: meetup.user_id,
      user_id: req.userId,
    });
    return res.json(newRegistration);
  }
}

export default new RegisterController();
