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

app.use('/public', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use('/', require('./routes/router')); //put router after everything it needs in index file

app.get('/welcome', (req, res) => {
    if (!req.session.user) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.redirect('/');
    }
});

app.get('/', (req, res) => {
    if (req.session.user) {
        db.checkRecordExists('*', 'athletes', 'id = $1', [req.session.user.id]).then((userExists) => {
            if (userExists) {
                res.sendFile(__dirname + '/public/index.html');
            } else {
                req.session.user = null;
                res.redirect('/welcome');
            }
        });
    } else {
        res.redirect('/welcome');
    }
});

app.get('*', (req, res) => {
    if (req.session.user) {
        db.checkRecordExists('*', 'athletes', 'id = $1', [req.session.user.id]).then((userExists) => {
            if (userExists) {
                res.sendFile(__dirname + '/public/index.html');
            } else {
                req.session.user = null;
                res.redirect('/welcome');
            }
        });
    } else {
        res.redirect('/welcome');
    }
});

app.listen(8080, () => {
    console.log("listening");
});
