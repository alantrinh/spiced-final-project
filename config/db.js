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

module.exports.initialiseDb = initialiseDb;
module.exports.checkRecordExists = checkRecordExists;
module.exports.insertAthlete = insertAthlete;
module.exports.authenticateUser = authenticateUser;
