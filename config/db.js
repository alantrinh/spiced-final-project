const fs = require('fs');
const initialiseDbSql = fs.readFileSync(__dirname + "/initialise_db.sql").toString();
const postgresLogin = require('./postgres_login.json');
const spicedPg = require('spiced-pg');
const db = spicedPg(process.env.DATABASE_URL || `postgres:${postgresLogin.user}:${postgresLogin.pw}@localhost:5432/spiced-final-project`);
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
        db.query('INSERT INTO activities (user_id, file_name, data) VALUES ($1, $2, $3);', [userId, fileName, activityData]).then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject('error inserting file to database, please try again');
        });
    });
}

function getUserActivities(userId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT id , title,
        data->'sessions'->0->>'start_time' AS start_time,
        data->'sessions'->0->>'total_distance' AS distance,
        data->'sessions'->0->>'total_ascent' AS elevation
        FROM activities
        WHERE user_id = $1
        ORDER BY data->'sessions'->0->>'start_time' DESC;`, [userId]).then((results) => {
            resolve(results.rows);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getActivity(activityId) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT id, user_id, title, description,
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
        WHERE id = $1;`, [activityId]).then((results) => {
            resolve(results.rows[0]);
        }).catch((err) => {
            reject((err));
        });
    });
}

module.exports.initialiseDb = initialiseDb;
module.exports.checkRecordExists = checkRecordExists;
module.exports.insertAthlete = insertAthlete;
module.exports.authenticateUser = authenticateUser;
module.exports.uploadActivity = uploadActivity;
module.exports.getUserActivities = getUserActivities;
module.exports.getActivity = getActivity;
