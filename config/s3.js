const fs = require('fs');
const knox = require('knox');


let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
    // secrets = require('../secrets'); // secrets.json is in .gitignore
} else {
    secrets = require('../secrets'); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'stravita'
});



function toS3(req, res, next){
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });
    const readStream = fs.createReadStream(req.file.path);
    console.log("path", req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        console.log("s3response",s3Response.statusCode);
        const wasSuccessful = s3Response.statusCode == 200;
        if (wasSuccessful) {
            next();
        } else {
            res.json({
                "err" : true
            });
        }
    });
}


module.exports.toS3 = toS3;
