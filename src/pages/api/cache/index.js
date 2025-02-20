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

function subtractSeconds(seconds) {
  // Get the current date and time
  const currentDate = new Date();

  // Subtract the specified number of seconds
  currentDate.setSeconds(currentDate.getSeconds() - (604800 - seconds));

  // Format the date as day/month/year hour:minutes
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/`
      + `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/`
      + `${currentDate.getFullYear()} `
      + `${currentDate.getHours().toString().padStart(2, '0')}:`
      + `${currentDate.getMinutes().toString().padStart(2, '0')}`;

  // Return the formatted date
  return formattedDate;
}

// Vercel serverless function
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('PROCESSING GET REQUEST');
      // Function to get all keys and TTLs
      const getRedisKeysWithTTL = async () => {
        const keyTTLMap = {};
        let cursor = 0;
        // eslint-disable-next-line no-await-in-loop
        const result = await redis.scan(cursor, { match: '*', count: 100 });
        console.log('result');
        console.log(result);
        const [nextCursor, keys] = result;
        cursor = nextCursor;
        console.log('nextCursor');
        console.log(nextCursor);

        keys.forEach(async (key) => {
          const ttl = await redis.ttl(key);
          console.log('ttl');
          console.log(ttl);
          keyTTLMap[key] = ttl;
        });

        await Promise.all(keys.map(async (key) => {
          const ttl = await redis.ttl(key);
          console.log('ttl');
          console.log(ttl);
          keyTTLMap[key] = ttl;
        }));

        // do {
        // // eslint-disable-next-line no-await-in-loop
        //   const [nextCursor, keys] = await redis.scan(cursor, { match: '*', count: 100 });
        //   cursor = nextCursor;

        //   keys.forEach(async (key) => {
        //     const ttl = await redis.ttl(key);
        //     keyTTLMap[key] = ttl;
        //   });
        // } while (cursor !== 0);

        return keyTTLMap;
      };

      // Get the keys and TTLs
      const keysWithTTL = await getRedisKeysWithTTL();
      console.log('GOT KEYS WITH TTL');

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
        <h1>Redis Keys and TTLs</h1>
        <table>
          <tr>
            <th>Key</th>
            <th>Updated At</th>
          </tr>
    `;

      // Add rows for each key and TTL
      const entries = Object.entries(keysWithTTL);
      entries.forEach((pair) => {
        const [key, ttl] = pair;

        let ttlDisplay;
        if (ttl === -1) {
          ttlDisplay = 'No expiry';
        } else if (ttl === -2) {
          ttlDisplay = 'Key does not exist';
        } else {
          ttlDisplay = ttl;
        }

        html += `
          <tr>
            <td>${escapeHtml(key)}</td>
            <td>${subtractSeconds(escapeHtml(String(ttlDisplay)))}</td>
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
      console.log('GOING TO SEND RESPONSE');
      console.log(keysWithTTL);
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
