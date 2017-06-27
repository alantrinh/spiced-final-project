const fs = require('fs');
const initialiseDbSql = fs.readFileSync(__dirname + "/initialise_db.sql").toString();
const postgresLogin = require('./postgres_login.json');
const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || `postgres:${postgresLogin.user}:${postgresLogin.pw}@localhost:5432/stravita`);
const bcrypt = require('bcryptjs');

function initialiseDb() {
    db.query(initialiseDbSql).then(() => {
        console.log("created table");
    }).catch((err) => {
        console.log(err);
    });
}

function checkRecordExists(column, table, condition, userInput){
    let q = `SELECT ${column} FROM ${table} WHERE ${condition};`;
    return db.query(q, userInput).then((results) => {
        if (results.rows[0]) {
            return true;
        } else {
            return false;
        }
    }).catch((err) => {
        console.log(err);
    });
}

function insertAthlete(firstName, lastName, email, password) {
    return new Promise((resolve, reject) => {
        hashPassword(password).then((passwordHash) => {
            db.query(`INSERT INTO athletes (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email;`, [firstName, lastName, email, passwordHash]).then((results) => {
                resolve(results);
            }).catch((err) => {
                reject(err);
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

function hashPassword(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(enteredPassword, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(enteredPassword, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            }
            resolve(doesMatch);
        });
    });
}

function authenticateUser(email, password) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * from athletes WHERE email = $1;`, [email]).then((results) => {
            if (results.rows[0] == undefined) {
                reject('Email does not exist, please try again');
            } else {
                checkPassword(password, results.rows[0]["password_hash"]).then((matches) => {
                    if (matches) {
                        resolve(results.rows[0]);
                    } else {
                        reject('Incorrect password, please try again');
                    }
                }).catch((err) => {
                    console.log(err);
                    reject('Something went wrong, please try again');
                });
            }
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function uploadActivity(userId, fileName, activityData) {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO activities (user_id, file_name, data) VALUES ($1, $2, $3) RETURNING id;', [userId, fileName, activityData]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('error inserting file to database, please try again');
        });
    });
}

function getUserActivities(userId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT first_name, last_name, image_url, activities.id, title,
        data->'sessions'->0->>'start_time' AS start_time,
        data->'sessions'->0->>'total_distance' AS distance,
        data->'sessions'->0->>'total_ascent' AS elevation
        FROM activities
        JOIN athletes
        ON user_id = athletes.id
        WHERE user_id = $1
        ORDER BY data->'sessions'->0->>'start_time' DESC;`, [userId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getFollowedActivities(userId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT first_name, last_name, image_url, activities.id, user_id, title,
        data->'sessions'->0->>'start_time' AS start_time,
        data->'sessions'->0->>'total_distance' AS distance,
        data->'sessions'->0->>'total_ascent' AS elevation
        FROM activities
        JOIN athletes
        ON user_id = athletes.id
        WHERE user_id IN
        (SELECT id from athletes WHERE id = $1
        UNION
        SELECT recipient_id FROM follower_requests WHERE sender_id = $1 AND status = 'accepted'
        UNION
        SELECT sender_id FROM follower_requests WHERE recipient_id = $1 AND status = 'accepted')
        ORDER BY data->'sessions'->0->>'start_time' DESC;`, [userId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getUserActivitySummary(userId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT COUNT(id) AS activity_count FROM activities WHERE user_id = $1;`, [userId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getActivity(activityId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT first_name, last_name, image_url, activities.id, user_id, title, description,
        data->'sessions'->0->>'start_time' AS start_time,
        data->'sessions'->0->>'total_distance' AS distance,
        data->'sessions'->0->>'total_timer_time' AS moving_time,
        data->'sessions'->0->>'total_ascent' AS elevation,
        data->'sessions'->0->>'normalized_power' AS weighted_avg_power,
        data->'sessions'->0->>'total_work' AS total_work,
        data->'sessions'->0->>'avg_speed' AS avg_speed,
        data->'sessions'->0->>'max_speed' AS max_speed,
        data->'sessions'->0->>'avg_heart_rate' AS avg_heart_rate,
        data->'sessions'->0->>'max_heart_rate' AS max_heart_rate,
        data->'sessions'->0->>'avg_cadence' AS avg_cadence,
        data->'sessions'->0->>'max_cadence' AS max_cadence,
        data->'sessions'->0->>'avg_power' AS avg_power,
        data->'sessions'->0->>'max_power' AS max_power,
        data->'sessions'->0->>'total_calories' AS calories,
        data->'sessions'->0->>'total_elapsed_time' AS elapsed_time
        FROM activities
        JOIN athletes
        ON user_id = athletes.id
        WHERE activities.id = $1;`, [activityId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            reject((err));
        });
    });
}

function updateActivity(id, title, description) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE activities SET title = $2, description = $3 WHERE id =$1 RETURNING title, description;`, [id, title, description]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('unable to update activity');
        });
    });
}

function addComment(activityId, userId, comment) {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO comments (activity_id, user_id, comment) VALUES ($1, $2, $3);`, [activityId, userId, comment]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('unable to add comment');
        });
    });
}

function getComments(activityId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT comment, comments.created_at, athletes.id, image_url, first_name, last_name, city, state, country
            FROM comments
            JOIN athletes
            ON athletes.id = comments.user_id
            WHERE activity_id = $1
            ORDER BY comments.created_at DESC;`, [activityId]).then((results) => {
                resolve(results.rows);
            }).catch((err) => {
                console.log(err);
                reject('unable to get comments');
            });
    });
}

function deleteActivity(id) {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM activities WHERE id = $1;`, [id]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('unable to delete activity');
        });
    });
}

function searchAthletes(searchTerm) {
    return new Promise((resolve, reject) => {
        if (searchTerm) {
            let searchTerms = searchTerm.split(" ");
            if (searchTerms.length == 1) {
                const searchTerm1 = searchTerms[0] + '%';
                db.query(`SELECT * FROM athletes WHERE first_name ILIKE $1 OR last_name ILIKE $1 ORDER BY first_name;`, [searchTerm1]).then((results) => {
                    resolve(results.rows);
                }).catch((err) => {
                    console.log(err);
                    reject('Something went wrong, please try again');
                });
            } else {
                const searchTerm1 = searchTerms[0] + '%';
                const searchTerm2 = searchTerms[1] + '%';
                db.query(`SELECT * FROM athletes WHERE (first_name ILIKE $1 AND last_name ILIKE $2) OR (first_name ILIKE $2 AND last_name Ilike $1) ORDER BY first_name;`, [searchTerm1, searchTerm2]).then((results) => {
                    resolve(results.rows);
                }).catch((err) => {
                    console.log(err);
                    reject('Something went wrong, please try again');
                });
            }
        } else {
            db.query(`SELECT * FROM athletes ORDER BY first_name;`).then((results) => {
                resolve(results.rows);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        }
    });
}

function getAthleteById(id) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM athletes WHERE id = $1;`, [id]).then((results) => {
            if(results.rows[0]) {
                resolve(results.rows[0]);
            } else {
                reject(`No athlete with ID '${id}' exists`);
            }
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function updateCity(city, id) {
    return new Promise((resolve, reject) => {
        db.query('UPDATE athletes SET city = $1 WHERE id = $2;', [city, id]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('unable to update city');
        });
    });
}

function updateState(state, id) {
    return new Promise((resolve, reject) => {
        db.query('UPDATE athletes SET state = $1 WHERE id = $2;', [state, id]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('unable to update state');
        });
    });
}

function updateCountry(country, id) {
    return new Promise((resolve, reject) => {
        db.query('UPDATE athletes SET country = $1 WHERE id = $2;', [country, id]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('unable to update country');
        });
    });
}

function uploadProfileImage(imageUrl, id) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE athletes SET image_url = $1 WHERE id = $2 RETURNING image_url;`, ['/uploads/' + imageUrl, id]).then((results) => {
            if (results.rows[0] == undefined) {
                reject('id does not exist, please try again');
            } else {
                resolve(results.rows[0]);
            }
        }).catch((err) => {
            console.log(err);
            reject('Unable to update profile image, please try again');
        });
    });
}

function deleteProfileImage(id) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE athletes SET image_url = null WHERE id = $1;`, [id]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('Unable to delete profile image, please try again');
        });
    });
}

//==========SOCIAL QUERIES============//

function getFriendStatus(viewedUserId, currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM follower_requests WHERE (recipient_id = $1 AND sender_id = $2) OR (recipient_id = $2 AND sender_id = $1);`, [viewedUserId, currentUserId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function makeFriendRequest(recipientId, senderId, friendStatus) {
    return new Promise((resolve, reject) => {
        if (friendStatus == null) {
            db.query(`INSERT INTO follower_requests (recipient_id, sender_id, status, updated_at) VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP) RETURNING status;`, [recipientId, senderId]).then((results) => {
                resolve(results.rows[0].status);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        } else {
            db.query(`UPDATE follower_requests SET status = 'pending', recipient_id = $1, sender_id = $2, updated_at = CURRENT_TIMESTAMP WHERE (recipient_id = $1 AND sender_id = $2) OR (recipient_id = $2 AND sender_id = $1) RETURNING status;`, [recipientId, senderId]).then((results) => {
                resolve(results.rows[0].status);
            }).catch((err) => {
                console.log(err);
                reject('Something went wrong, please try again');
            });
        }
    });
}

function cancelFriendRequest(recipientId, senderId) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE follower_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE recipient_id = $1 AND sender_id = $2 RETURNING status;`,[recipientId, senderId]).then((results) => {
            resolve(results.rows[0].status);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function acceptFriendRequest(recipientId, senderId) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE follower_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE recipient_id = $1 AND sender_id = $2 RETURNING status;`, [recipientId, senderId]).then((results) => {
            resolve(results.rows[0].status);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function unfriend(viewedUserId, currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE follower_requests SET status = 'unfriended', updated_at = CURRENT_TIMESTAMP WHERE (recipient_id = $1 AND sender_id = $2) OR (recipient_id = $2 AND sender_id = $1) RETURNING status;`, [viewedUserId, currentUserId]).then((results) => {
            resolve(results.rows[0].status);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getReceivedFriendRequests(currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM athletes INNER JOIN follower_requests ON athletes.id = follower_requests.sender_id WHERE follower_requests.recipient_id = $1 AND follower_requests.status = 'pending';`, [currentUserId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getSentFriendRequests(currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM athletes INNER JOIN follower_requests ON athletes.id = follower_requests.recipient_id WHERE follower_requests.sender_id = $1 AND follower_requests.status = 'pending';`, [currentUserId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function getFriends(currentUserId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM athletes JOIN (SELECT recipient_id AS friends_id FROM follower_requests WHERE sender_id = $1 AND status = 'accepted' UNION SELECT sender_id as friends_id FROM follower_requests WHERE recipient_id = $1 AND status = 'accepted') AS friends ON athletes.id = friends.friends_id;`, [currentUserId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            console.log(err);
            reject('Something went wrong, please try again');
        });
    });
}

function giveKudos(activityId, userId) {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO kudos (activity_id, user_id) VALUES ($1, $2);`, [activityId, userId]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('Error giving kudos, please try again');
        });
    });
}

function removeKudos(activityId, userId) {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM kudos WHERE activity_id = $1 AND user_id = $2;`, [activityId, userId]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('Error giving kudos, please try again');
        });
    });
}

function hasAlreadyGivenKudos(activityId, userId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT id FROM kudos WHERE activity_id = $1 AND user_id = $2;`, [activityId, userId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('Error checking if kudos already given, please try again');
        });
    });
}

function getKudosCount(activityId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT count(id) FROM kudos WHERE activity_id = $1`, [activityId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            console.log(err);
            reject('Error getting kudos count, please try again');
        });
    });
}

function getKudosGivers(activityId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT athletes.id, image_url, first_name, last_name, city, state, country
            FROM athletes
            JOIN kudos
            ON athletes.id = kudos.user_id
            WHERE kudos.activity_id = $1;`, [activityId]).then((results) => {
                resolve(results.rows);
            }).catch((err) => {
                console.log(err);
                reject('Error retrieving kudos givers, please try again');
            });
    });
}

module.exports.initialiseDb = initialiseDb;
module.exports.checkRecordExists = checkRecordExists;
module.exports.insertAthlete = insertAthlete;
module.exports.authenticateUser = authenticateUser;
module.exports.uploadActivity = uploadActivity;
module.exports.getUserActivities = getUserActivities;
module.exports.getFollowedActivities = getFollowedActivities;
module.exports.getUserActivitySummary = getUserActivitySummary;
module.exports.getActivity = getActivity;
module.exports.searchAthletes = searchAthletes;
module.exports.getAthleteById = getAthleteById;
module.exports.updateCity = updateCity;
module.exports.updateState = updateState;
module.exports.updateCountry = updateCountry;
module.exports.uploadProfileImage = uploadProfileImage;
module.exports.deleteProfileImage = deleteProfileImage;
module.exports.updateActivity = updateActivity;
module.exports.addComment = addComment;
module.exports.getComments = getComments;
module.exports.deleteActivity = deleteActivity;

module.exports.getFriendStatus = getFriendStatus;
module.exports.makeFriendRequest = makeFriendRequest;
module.exports.cancelFriendRequest = cancelFriendRequest;
module.exports.acceptFriendRequest = acceptFriendRequest;
module.exports.unfriend = unfriend;
module.exports.getReceivedFriendRequests = getReceivedFriendRequests;
module.exports.getSentFriendRequests = getSentFriendRequests;
module.exports.getFriends = getFriends;

module.exports.giveKudos = giveKudos;
module.exports.removeKudos = removeKudos;
module.exports.hasAlreadyGivenKudos = hasAlreadyGivenKudos;
module.exports.getKudosCount = getKudosCount;
module.exports.getKudosGivers = getKudosGivers;
