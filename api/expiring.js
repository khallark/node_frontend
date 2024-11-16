const path = require('path');

module.exports = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/4expire_6.html'));
};