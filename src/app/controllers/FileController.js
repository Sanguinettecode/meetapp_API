import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname, filename } = req.file;
    const { id, name, path, url } = await File.create({
      name: originalname,
      path: filename,
    });

    return res.json({
      id,
      name,
      path,
      url,
    });
  }
}
export default new FileController();
