import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { url, filename } = req.query;
    const fileUrl = url;

    try {
      const response = await axios.get(fileUrl, { responseType: 'stream' });
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', response.headers['content-type']);
      response.data.pipe(res);
    } catch (error) {
      console.error('Error downloading the file:', error);
      res.status(500).json({ error: 'Error downloading the file' });
    }
  }
}
