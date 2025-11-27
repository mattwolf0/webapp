const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 4001;

http.createServer(app).listen(PORT, () => {
  console.log(`Szerver fut a ${PORT} porton`);
});
