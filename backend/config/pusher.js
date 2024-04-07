const dotenv = require('dotenv');
dotenv.config();
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1758443',
  key: '91d2cc9b6e40b8c0804d',
  secret: 'dd490b3207697d62861f',
  cluster: 'eu',
  useTLS: true
});

module.exports = {
    pusher
};