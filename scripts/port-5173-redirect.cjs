const http = require('http');

const server = http.createServer((req, res) => {
  const targetUrl = `http://localhost:3000${req.url}`;
  res.writeHead(302, {
    'Location': targetUrl,
    'Content-Type': 'text/html',
  });
  res.end(`<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body>Redirecting to <a href="${targetUrl}">upay Sentinel Dashboard</a>...</body></html>`);
});

const PORT = 5173;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Port ${PORT} forwarder active -> redirecting to http://localhost:3000`);
});
