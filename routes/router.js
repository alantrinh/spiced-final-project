const express = require('express'),
    router = express.Router();
const db = require('./../config/db.js');
const EasyFit = require('easy-fit').default;
const fs = require('fs');

const multer = require('multer');
var diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/../uploads');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

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

    .post(uploader.single('file'), (req, res) => {
        if (req.file) {
            fs.readFile(__dirname + '/../uploads/' + req.file.filename, (err, content) => {
                let easyFit = new EasyFit({
                    lengthUnit: 'km',
                    speedUnit: 'km/h',
                });

                easyFit.parse(content, (err, activityData) => {
                    if (err) {
                        res.json({
                            error: true,
                            errorMessage: err
                        });
                    } else {
                        db.uploadActivity(req.session.user.id, req.file.filename, JSON.stringify(activityData)).then(() => {
                            // res.json ({
                            //     success: true,
                            //     data: JSON.stringify(activityData)
                            // });
                            res.send(JSON.stringify(activityData));
                        }).catch((err) => {
                            console.log(err);
                            res.json({
                                error: true,
                                errorMessage: err
                            });
                        });
                    }
                });
            });
        } else {
            res.json({
                error: true,
                errorMessage: 'Upload of activity failed'
            });
        }
    });

router.route('/getUserActivities')

    .get((req, res) => {
        db.getUserActivities(req.session.user.id).then((results) => {
            res.json({
                data: results
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/activity')

    .get((req, res) => {
        db.getActivity(req.query.id).then((results) => {
            res.json({
                data:results
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

module.exports = router;
