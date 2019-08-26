import Banner from '../models/Banner';

class BannerController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const banner = await Banner.create({
      name,
      path,
    });

    return res.json(banner);
  }
}

export default new BannerController();
