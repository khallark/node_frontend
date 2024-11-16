const express = require('express');
const app = express();
const path = require('path');


app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/1home.html'));
});
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/2search.html'));
});
app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/3create.html'));
});
app.get('/expiring', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/4expire_6.html'));
});
app.get('/expired', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/5expired.html'));
});


app.use(express.static('public'));


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});