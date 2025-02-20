import { Redis } from '@upstash/redis';

// Initialize Redis client with Upstash credentials
const redis = new Redis({
  token: process.env.KV_REST_API_TOKEN,
  url: process.env.KV_REST_API_URL,
});

// Simple HTML escape function to prevent XSS
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function subtractSeconds(date) {
  // Get the current date and time
  const updatedAt = new Date(date);

  // Format the date as day/month/year hour:minutes
  const formattedDate = `${updatedAt.getDate().toString().padStart(2, '0')}/`
      + `${(updatedAt.getMonth() + 1).toString().padStart(2, '0')}/`
      + `${updatedAt.getFullYear()} `
      + `${updatedAt.getHours().toString().padStart(2, '0')}:`
      + `${updatedAt.getMinutes().toString().padStart(2, '0')}`;

  // Return the formatted date
  return formattedDate;
}

// Vercel serverless function
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const jsonStatus = await redis.get('jsonStatus');

      // Generate HTML content
      let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redis Keys and TTLs</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; max-width: 800px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Assets and Date Updated</h1>
        <table>
          <tr>
            <th>Key</th>
            <th>Updated At</th>
          </tr>
    `;

      const entries = Object.entries(jsonStatus || {});
      const sortedByDate = entries.sort((a, b) => b[1] - a[1]);
      sortedByDate.forEach((pair) => {
        const [key, date] = pair;

        html += `
          <tr>
            <td>${escapeHtml(key)}</td>
            <td>${subtractSeconds(escapeHtml(date))}</td>
          </tr>
        `;
      });

      html += `
        </table>
      </body>
      </html>
    `;

      // Set content type to HTML and send response
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      console.error('Redis error:', error);
      const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Error</title>
      </head>
      <body>
        <h1>Error</h1>
        <p>Failed to fetch Redis keys: ${escapeHtml(String(error))}</p>
      </body>
      </html>
    `;
      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(errorHtml);
    }
  }
}
