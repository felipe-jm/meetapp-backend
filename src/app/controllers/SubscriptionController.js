import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const subscription = await Subscription.create({
      meetup_id: req.params.meetup_id,
      user_id: req.userId,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
