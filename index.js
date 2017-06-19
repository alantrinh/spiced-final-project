const express = require('express');
const app = express();
const db = require('./config/db.js');

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}

// db.initialiseDb();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: 'a really hard to guess secret',
    maxAge: 1000 * 60 * 60 //cookie lasts an hour
}));

const csurf = require('csurf');
app.use(csurf());
app.use(function(req, res, next) {
    res.cookie('t', req.csrfToken());
    next();
});

app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/router')); //put router after everything it needs in index file

app.get('/welcome', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/public/index.html');
});

app.get('*', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/welcome');
    }
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080, () => {
    console.log("listening");
});
