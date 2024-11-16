const path = require('path');

module.exports = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/3create.html'));
};