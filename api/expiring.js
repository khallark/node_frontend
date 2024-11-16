const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const filePath = path.join(__dirname, '../public/expiring.html');
  
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading file');
      return;
    }
    res.status(200).send(data);
  });
};