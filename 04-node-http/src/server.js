const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ lab: '04-node-http', status: 'ok' }));
});

server.listen(8082, '0.0.0.0', () => {
  console.log('node-http ready on :8082');
});
