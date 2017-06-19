const express = require('express'),
    router = express.Router();
const db = require('./../config/db.js');
const EasyFit = require('easy-fit').default;
const fs = require('fs');

//ROUTES
router.route('/registerAthlete')

    .post((req, res) => {
        db.checkRecordExists('*', 'athletes', 'email = $1', [req.body.email.toLowerCase()]).then((emailExists) => {
            if (emailExists) {
                res.json({
                    error: true,
                    errorMessage: 'Email already exists'
                });
            } else {
                db.insertAthlete(req.body.firstName, req.body.lastName, req.body.email.toLowerCase(), req.body.password).then((results) => {
                    req.session.user = results.rows[0];
                    res.json({success: true});
                }).catch((err) => {
                    console.log(err);
                    res.json({
                        error: true,
                        errorMessage: 'Something went wrong, please try again'
                    });
                });
            }
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: 'Something went wrong, please try again'
            });
        });
    });

router.route('/authenticateUser')

    .post((req, res) => {
        db.authenticateUser(req.body.email.toLowerCase(), req.body.password).then((result) => {
            req.session.user = result;
            res.json({success: true});
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/uploadActivity')

    .post((req, res) => {
        fs.readFile(__dirname + '/2015-04-13-08-40-11.fit', (err, content) => {
            let easyFit = new EasyFit({
                lengthUnit: 'km',
                speedUnit: 'km/h',
            });

            easyFit.parse(content, (err, data) => {
                if (err) {
                    return res.json({
                        error: true,
                        errorMessage: err
                    });
                } else {
                    res.json ({
                        success: true,
                        data: JSON.stringify(data)
                    });
                }
            });
        });
    });

module.exports = router;
