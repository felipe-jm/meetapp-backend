import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
      subject: `New user subscribed to ${meetup.name}`,
      template: 'subscription',
      context: {
        organizer: meetup.organizer.name,
        name: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
