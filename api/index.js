const express = require('express');
const path = require('path');
const app = express();

// Routes
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/2search.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/3create.html'));
});

app.get('/expiring', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/4expire_6.html'));
});

app.get('/expired', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/5expired.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Export as a serverless function
module.exports = (req, res) => {
    app(req, res);
};