const express = require('express'),
    router = express.Router();
const db = require('./../config/db.js');
const EasyFit = require('easy-fit').default;
const fs = require('fs');
const s3 = require('../config/s3');

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
                        db.uploadActivity(req.session.user.id, req.file.filename, JSON.stringify(activityData)).then((results) => {
                            fs.unlink(__dirname + '/../uploads/' + req.file.filename, (err) => { //remove .fit file from server after upload to database
                                if(err) {
                                    console.log("unlink of activity failed", err);
                                }
                            });
                            res.json ({
                                data: results
                            });
                            // res.send(JSON.stringify(activityData));
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

router.route('/getFollowedActivities')

    .get((req, res) => {
        db.getFollowedActivities(req.session.user.id).then((results) => {
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

router.route('/getUserActivitySummary')

    .get((req, res) => {
        db.getUserActivitySummary(req.query.id).then((results) => {
            res.json({data: results});
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
                data: results,
                ownActivity: results.user_id == req.session.user.id
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/athletes')

    .get((req, res) => {
        if (req.query.q) {
            if (req.query.q == 'all') {
                db.searchAthletes().then((results) => {
                    res.json({
                        success: true,
                        data: results
                    });
                }).catch((err) => {
                    res.json({
                        error: true,
                        errorMessage: err
                    });
                });
            } else {
                db.searchAthletes(req.query.q).then((results) => {
                    res.json({
                        success: true,
                        data: results
                    });
                }).catch((err) => {
                    res.json({
                        error: true,
                        errorMessage: err
                    });
                });
            }
        } else {
            res.json({
                id: req.session.user.id,
                firstName: req.session.user['first_name'],
                lastName: req.session.user['last_name'],
                email: req.session.user.email,
                imageUrl: req.session.user['image_url'],
                city: req.session.user.city,
                state: req.session.user.state,
                country: req.session.user.country
            });
        }
    });

router.route('/athlete')

    .get((req, res) => {
        if (req.query.id == req.session.user.id) {
            res.json({redirect: true});
        } else {
            db.getAthleteById(req.query.id).then((result) => {
                res.json({data: result});
            }).catch((err) => {
                console.log(err);
                res.json({
                    error: true,
                    errorMessage: err
                });
            });
        }
    });

router.route('/updateLocation')

    .post((req, res) => {
        let updateLocationPromises = [];
        if (req.body.city) {updateLocationPromises.push(db.updateCity(req.body.city, req.session.user.id));}
        if (req.body.state) {updateLocationPromises.push(db.updateState(req.body.state, req.session.user.id));}
        if (req.body.country) {updateLocationPromises.push(db.updateCountry(req.body.country, req.session.user.id));}

        Promise.all(updateLocationPromises).then(() => {
            req.session.user.city = req.body.city;
            req.session.user.state = req.body.state;
            req.session.user.country = req.body.country;

            res.json({
                success: true
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: 'location update failed'
            });
        });
    });

router.route('/uploadProfileImage')

    .post(uploader.single('file'), process.env.NODE_ENV == 'production' ? s3.toS3 : (req, res, next) => next(), (req, res) => {
        if (req.file) {
            db.uploadProfileImage(req.file.filename, req.session.user.id).then((result) => {
                req.session.user['image_url'] != null && fs.unlink(__dirname + '/..' + req.session.user['image_url'], (err) => {
                    if (err) {
                        console.log("unlink failed", err);
                    }
                });

                req.session.user['image_url'] = result['image_url'];
                res.json({
                    success: true,
                    imageUrl: result['image_url']
                });
            }).catch((err) => {
                res.json({
                    error: true,
                    errorMessage: err
                });
            });
        } else {
            res.json({
                error: true,
                errorMessage: 'Upload of profile image failed'
            });
        }
    });

router.route('/deleteProfileImage')

    .post((req, res) => {
        db.deleteProfileImage(req.session.user.id).then(()=> {
            fs.unlink(__dirname + '/..' + req.session.user['image_url'], (err) => {
                if(err) {
                    console.log("unlink failed", err);
                }
            });

            req.session.user['image_url'] = null;
            res.json({
                success: true,
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: 'Delete profile image failed'
            });
        });
    });

router.route('/updateActivity')

    .post((req, res) => {
        db.updateActivity(req.body.id, req.body.title, req.body.description).then((results) => {
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

router.route('/addComment')

    .post((req, res) => {
        db.addComment(req.query.id, req.session.user.id, req.body.comment).then(() => {
            res.json({
                success: true
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/getComments')

    .get((req, res) => {
        db.getComments(req.query.id).then((results) => {
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

router.route('/deleteActivity')

    .post((req, res) => {
        db.deleteActivity(req.query.id).then(() => {
            res.json({
                success: true
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

//=====SOCIAL ROUTES======//

router.route('/friendStatus/:id')

    .get((req, res) => {
        db.getFriendStatus(req.params.id, req.session.user.id, req.body.friendStatus).then((result) => {
            let recipient;
            if (result['recipient_id'] == req.session.user.id) {
                recipient = true;
            } else {
                recipient = false;
            }
            res.json({
                success: true,
                friendStatus: result.status,
                recipient: recipient
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/makeFriendRequest/:id')

    .post((req, res) => {
        db.makeFriendRequest(req.params.id, req.session.user.id, req.body.friendStatus).then((result) => {
            res.json({
                success: true,
                friendStatus: result,
                recipient: false
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/cancelFriendRequest/:id')

    .post((req, res) => {
        db.cancelFriendRequest(req.params.id, req.session.user.id).then((result) => {
            res.json({
                success: true,
                friendStatus: result
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/acceptFriendRequest/:id')

    .post((req, res) => {
        db.acceptFriendRequest(req.session.user.id, req.params.id).then((result) => {
            res.json({
                success: true,
                friendStatus: result
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/unfriend/:id')

    .post((req, res) => {
        db.unfriend(req.params.id, req.session.user.id).then((result) => {
            res.json({
                success: true,
                friendStatus: result
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/getReceivedFriendRequests')

    .get((req, res) => {
        db.getReceivedFriendRequests(req.session.user.id).then((results) => {
            res.json({
                success: true,
                data: results
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/getSentFriendRequests')

    .get((req, res) => {
        db.getSentFriendRequests(req.session.user.id).then((results) => {
            res.json({
                success: true,
                data: results
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/getFriends')

    .get((req, res) => {
        db.getFriends(req.session.user.id).then((results) => {
            res.json({
                success: true,
                data: results
            });
        }).catch((err) => {
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/giveKudos')

    .post((req, res) => {
        db.giveKudos(req.query.id, req.session.user.id).then(() => {
            res.json({
                success: true
            });
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/removeKudos')

    .post((req, res) => {
        db.removeKudos(req.query.id, req.session.user.id).then(() => {
            res.json({success: true});
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/hasAlreadyGivenKudos')

    .get((req, res) => {
        db.hasAlreadyGivenKudos(req.query.id, req.session.user.id).then((hasGivenKudos) => {
            res.send(hasGivenKudos);
        }).catch((err) => {
            console.log(err);
            res.json({
                error: true,
                errorMessage: err
            });
        });
    });

router.route('/getKudosCount')

    .get((req, res) => {
        db.getKudosCount(req.query.id).then((results) => {
            res.send(results);
        });
    });

router.route('/getKudosGivers')

    .get((req, res) => {
        db.getKudosGivers(req.query.id).then((results) => {
            res.json({
                data: results
            });
        });
    });

router.route('/logOut')

    .get((req, res) => {
        req.session.user = null;
        res.redirect('/welcome');
    });

module.exports = router;
