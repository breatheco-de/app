import { Redis } from '@upstash/redis';
import { formatDistance } from 'date-fns';

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

function formatDate(date) {
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
          .search-container { margin-bottom: 20px; }
          #searchInput { padding: 8px; width: 200px; }
          .hidden { display: none; }
        </style>
      </head>
      <body>
        <h1>Assets and Date Updated</h1>
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search keys..." onkeyup="searchTable()">
        </div>
        <table id="dataTable">
          <tr>
            <th>Key</th>
            <th>Updated At</th>
            <th>Time Ago</th>
          </tr>
    `;

      const entries = Object.entries(jsonStatus || {});
      // Sort by date (most recent first)
      const sortedByDate = entries.sort((a, b) => b[1] - a[1]);

      sortedByDate.forEach((pair) => {
        const [key, date] = pair;
        const updatedAt = formatDate(date);
        const timeAgo = formatDistance(new Date(date), new Date(), { addSuffix: true });

        html += `
          <tr>
            <td>${escapeHtml(key)}</td>
            <td>${updatedAt.toLocaleString()}</td>
            <td>${timeAgo}</td>
          </tr>
        `;
      });

      html += `
        </table>
        <script>
          function searchTable() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const table = document.getElementById('dataTable');
            const tr = table.getElementsByTagName('tr');

            for (let i = 1; i < tr.length; i++) {
              const td = tr[i].getElementsByTagName('td')[0];
              if (td) {
                const txtValue = td.textContent || td.innerText;
                tr[i].classList.toggle('hidden', txtValue.toLowerCase().indexOf(filter) === -1);
              }
            }
          }

          function getTimeAgo(timestamp) {
            const now = new Date();
            const secondsPast = (now.getTime() - (timestamp * 1000)) / 1000;
            
            if (secondsPast < 60) return Math.round(secondsPast) + ' seconds ago';
            if (secondsPast < 3600) return Math.round(secondsPast / 60) + ' minutes ago';
            if (secondsPast < 86400) return Math.round(secondsPast / 3600) + ' hours ago';
            if (secondsPast < 604800) return Math.round(secondsPast / 86400) + ' days ago';
            return Math.round(secondsPast / 604800) + ' weeks ago';
          }
        </script>
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
