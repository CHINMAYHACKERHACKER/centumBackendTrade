const express = require("express");
const cors = require("cors");
const con = require("./MYSQL.js");
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = multer({ dest: 'upload/' });
const VIDEO = multer({ dest: 'VIDEO/' });
const twilio = require('twilio');
const moment = require('moment');
require('moment-duration-format');
const bodyParser = require('body-parser');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

PUBLISHABLE_KEY = "pk_test_51NI5o0SAzinzFTdr3jkeLcPPyKXrjHJJHRVfIdEvLAXsHouyREWY7iza3qnVTx6ndEvD1BgpV3agl93RSJ5jWJAd00bzApCnhj";

SECRET_KEY = "sk_test_51NI5o0SAzinzFTdr5UshicljwmVZrwfzvFBVOrCg2lMyZcMjj9UphvO0ED5te1wti0WbsXA91REoSB9UlHIPwSFg00EV9u6qbr";

const stripe = require('stripe')(SECRET_KEY);
const cron = require('node-cron');
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
app.use("/upload", express.static("./upload"));
app.use("/VIDEO", express.static("./VIDEO"));

app.use(bodyParser.json());



const accountSid = 'AC6191a6f909440b674500d2eb31bd2786'; // Replace with your Twilio account SID
const authToken = 'f111833908d76a9ee4f66eb525cfd56f';

const CHAT_ENGINE_PROJECT_ID = "7923a155-1379-4fb6-a475-975e98ef3694";
const CHAT_ENGINE_PRIVATE_KEY = "5f6597f4-6be4-4137-9ca9-80315afc009b";

const client = twilio(accountSid, authToken);

app.post('/LOGIN', (req, res) => {
    const username = req.body.LOGINUSERNAME;
    const password = req.body.LOGINPASSWORD;
    const LOGINUSERUNIQUEID = req.body.LOGINUSERUNIQUEID;
    console.log('Username:', username);
    console.log('Password:', password);

    // Query the MySQL database to find the user
    // Replace 'users' with your actual table name
    con.query('SELECT * FROM USERSIGNUPDATA WHERE USERNAME = ?', [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            if (results.length > 0) {
                console.log(results);
                const user = results[0];
                const storedUsername = user.USERNAME;
                const storedPassword = user.PASSWORD;
                const UNIQUEID = user.USERGENERATEUNIQUEID;


                // Compare the plain text password with the stored password
                if (password == storedPassword && username == storedUsername && UNIQUEID == LOGINUSERUNIQUEID) {
                    console.log('Valid username and password');
                    res.json({ message: 'Valid username and password' });
                } else {
                    res.json({ message: 'Invalid username or password' });
                    console.log('Invalid username or password');
                }
            } else {
                console.log('Invalid username or password');
            }
        }
    });
});



app.post("/SIGN", upload.any('INDIAIMAGE'), (req, res, next) => {
    console.log(req);
    const REFERLID = req.body.REFERLID;
    const SELECTEDREFERLID = req.body.SELECTEDREFERLID;
    const USERNAME = req.body.USERNAME;
    const MOBILENUMBER = req.body.MOBILENUMBER;
    const EMAIL = req.body.EMAIL;
    const Adress = req.body.Adress;
    const GENDER = req.body.GENDER;
    const CITIZENSHIP = req.body.CITIZENSHIP;
    const INDIAPANNUMBER = req.body.INDIAPANNUMBER;
    const INDIAADHARNUMBER = req.body.INDIAADHARNUMBER;
    const OTHERCOUNTRYIDNUMBER = req.body.OTHERCOUNTRYIDNUMBER;
    const USERID = req.body.USERID;
    const PASSWORD = req.body.PASSWORD;
    const USERUNIQUEID = req.body.USERGENERATEDUNIQUEID;
    let INDIAIMAGE = null;
    let DESTINATION = null;
    let USERINDIAIMAGE = null;
    let USERDESTINATION;

    // // Generate a salt to use for hashing
    // bcrypt.genSalt(10, (saltError, salt) => {
    //     if (saltError) {
    //         console.error(saltError);
    //         res.status(500).json({ error: 'Internal server error' });
    //     } else {
    //         // Hash the password with the generated salt
    //         bcrypt.hash(req.body.PASSWORD, salt, (hashError, hashedPassword) => {
    //             if (hashError) {
    //                 console.error(hashError);
    //                 res.status(500).json({ error: 'Internal server error' });
    //             } else {
    //                 // Use the hashed password as needed (e.g., store it in the database)
    //                 console.log(hashedPassword);
    //                 PASSWORD = hashedPassword;

    //             }
    //         });
    //     }
    // });


    req.files.forEach((file, index) => {
        const fieldname = file.fieldname;
        if (fieldname === 'INDIAIMAGE') {
            if (index === 0) {
                INDIAIMAGE = file.filename;
                DESTINATION = file.destination;
            } else if (index === 1) {
                USERINDIAIMAGE = file.filename;
                USERDESTINATION = file.destination;
            }
        }
    });


    req.files.forEach((file) => {
        const fieldname = file.fieldname;
        if (fieldname == "OTHERIMAGE") {
            INDIAIMAGE = file.filename;
            DESTINATION = file.destination;
        }
    });

    // Save the user data to the database
    con.query(`INSERT INTO USERSIGNUPDATA (ReferralID,DropDownReferralID,USERNAME,MOBILENUMBER,EMAIL,ADDRESS,Gender,CITIZENSHIP,PANNUMBER,ADHARNUMBER,INDIANIMAGE,OTHERCOUNTRYIDNUMBER,USERID,PASSWORD,USERINDIAIMAGE,USERGENERATEUNIQUEID) 
values ('${REFERLID}','${SELECTEDREFERLID}','${USERNAME}','${"+" + MOBILENUMBER}','${EMAIL}','${Adress}','${GENDER}','${CITIZENSHIP}','${INDIAPANNUMBER}','${INDIAADHARNUMBER}','${DESTINATION + INDIAIMAGE}','${OTHERCOUNTRYIDNUMBER}','${USERID}','${PASSWORD}','${USERDESTINATION + USERINDIAIMAGE}','${USERUNIQUEID}')`,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(data);
            }
        });
});


app.post('/FORGOTPASSWORD', (req, res) => {

    const OTP = req.body.OTP;
    const PASSWORD = req.body.PASSWORD;

    con.query(`UPDATE USEROTPDATA SET PASSWORD='${PASSWORD}' where OTP='${OTP}'`, (ERR, DATA, fields) => {
        if (ERR) {
            console.log(ERR);
        }
        else {
            res.send(DATA);
        }
    })
});



// Generate a random OTP code
function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// Send OTP to the provided mobile number
function sendOTP(mobileNumber, OTP) {
    const message = `Your OTP for verification is: ${OTP}`;

    client.messages.create({
        body: message,
        from: '+13614541013',
        to: mobileNumber
    })
        .then(() => {
            console.log('OTP sent successfully');
        })
        .catch((error) => {
            console.error('Error sending OTP:', error);
        });
}

// Route to initiate OTP verification and send OTP
app.post('/sendOTP', (req, res) => {
    try {
        const { mobileNumber } = req.body;
        console.log(mobileNumber);
        const OTP = generateOTP();

        otpStorage[mobileNumber] = OTP;
        console.log(otpStorage[mobileNumber]);

        con.query(`UPDATE USEROTPDATA
        SET OTP = '${otpStorage[mobileNumber]}'
        WHERE MOBILENUMBER = '${"+" + mobileNumber}'`, (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                // After the database update is executed, send the response
                sendOTP("+" + mobileNumber, OTP);
                res.status(200).json({ message: 'OTP sent successfully' });
            }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});



// Route to verify OTP
app.post('/verifyOTP', (req, res) => {
    console.log(req);
    try {
        var { mobileNumber, OTP } = req.body;
        if (mobileNumber) {
            mobileNumber = "+" + mobileNumber;
        }
        // const storedOTP = otpStorage[mobileNumber];

        // Query the MySQL database to find the user
        // Replace 'users' with your actual table name
        con.query('SELECT * FROM USEROTPDATA WHERE MOBILENUMBER = ?', [mobileNumber], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.length > 0) {
                    console.log(results);
                    const user = results[0];
                    const STOREDOTPNUMBER = user.OTP;

                    // Compare the plain text password with the stored password
                    if (OTP == STOREDOTPNUMBER) {
                        console.log("OTP verification successful");
                        res.json({ message: 'OTP verification successful' });
                    } else {
                        // res.json({ message: 'Invalid username or password' });
                        console.log("Invalid OTP");

                        res.status(400).json({ error: 'Invalid OTP' });
                    }
                } else {
                    // console.log('Invalid username or password');
                }
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});



app.post('/api/session', (req, res) => {
    const { Open, LOCALUSERDTORE } = req.body;
    const { Close, LOCALUSERDTORAGE } = req.body;

    if (Open) {
        console.log("GOT OPEN");

        const duration = Open; // Assuming Open duration is in milliseconds

        // Convert duration to hours, minutes, and seconds
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);

        console.log(`Duration: ${hours}h ${minutes}m ${seconds}s`);

        con.query(`INSERT INTO USERSESSIONDATA (Open,LOCALUSERDTORE) 
    values (' ${hours}h ${minutes}m ${seconds}s','${LOCALUSERDTORE}')`,
            (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    res.send(data);
                }
            });
    }

    // console.log('Open:', Open);
    // console.log('LOCALUSERDTORE:', LOCALUSERDTORE);


    console.log(Close);


    if (Close) {


        const duration = Close; // Assuming Open duration is in milliseconds

        // Convert duration to hours, minutes, and seconds
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);

        console.log(`Duration: ${hours}h ${minutes}m ${seconds}s`);
        console.log("GOT CLOSE");

        con.query(`INSERT INTO USERSESSIONDATA (Close,LOCALUSERDTORAGE) 
    values (' ${hours}h ${minutes}m ${seconds}s','${LOCALUSERDTORAGE}')`,
            (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    res.send(data);
                }
            });
    }

    // console.log('Close:', Close);
    // console.log('LOCALUSERDTORAGE:', LOCALUSERDTORAGE);
});


// app.post('/payment', async (req, res) => {
//     const { amount, token, DESCRIPTION } = req.body;

//     try {
//         // Create a PaymentMethod using the card token
//         const paymentMethod = await stripe.paymentMethods.create({
//             type: 'card',
//             card: {
//                 token: token.id,
//             },
//             billing_details: {
//                 name: token.card.name,
//                 email: token.email,
//                 address: {
//                     line1: token.card.address_line1,
//                     line2: token.card.address_line2,
//                     city: token.card.address_city,
//                     country: token.card.address_country_code,
//                     postal_code: token.card.address_zip,
//                 },
//             },
//         });

//         // Create a PaymentIntent
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount,
//             currency: 'INR',
//             payment_method_types: ['card'],
//             payment_method: paymentMethod.id,
//             customer: token.customer,
//             description: DESCRIPTION,
//             receipt_email: token.email,
//             confirm: true,
//             setup_future_usage: 'off_session',
//             // Enable 3D Secure or Strong Customer Authentication
//             payment_method_options: {
//                 card: {
//                     request_three_d_secure: 'automatic',
//                 },
//             },
//         });

//         // Handle the response or error
//         if (
//             paymentIntent.status === 'requires_action' &&
//             paymentIntent.next_action.type === 'use_stripe_sdk'
//         ) {
//             // Payment requires customer authentication
//             res.status(200).json({
//                 requires_action: true,
//                 payment_intent_client_secret: paymentIntent.client_secret,
//             });
//         } else if (paymentIntent.status === 'succeeded') {
//             // Payment succeeded
//             res.status(200).json({ message: 'Payment succeeded' });
//         } else {
//             // Payment failed
//             res.status(400).json({ error: 'Payment failed' });
//         }
//     } catch (error) {
//         // Handle any errors that occurred during the payment process
//         res.status(500).json({ error: error.message });
//     }
// });


const retrieveAllCharges = async () => {
    try {
        const charges = await stripe.charges.list();
        console.log('Charges:', charges.data);

        // Extracting required information from charges
        const chargeInfo = charges.data.map(charge => {
            const { status, amount, id, billing_details } = charge;
            const email = billing_details ? billing_details.email : null;
            const name = billing_details ? billing_details.name : null;
            return { status, amount, id, email, name };
        });

        console.log('Charge Information:', chargeInfo);

        // Inserting charges into the database
        chargeInfo.forEach(charge => {
            const { status, amount, id, email, name} = charge;
            console.log(email);
            const query = `UPDATE charges SET USERPAIDID='${id}', NAME='${name}', AMOUNT='${amount}', EMAIL='${email}', STATUS='${status}' where USEREMAILEMAIL='${email}'`;

            // Define the values to be used in the query
            const values = [id, name, amount, email, status];

            con.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error inserting charge:', error);
                } else {
                    // console.log('Charge inserted:', charge);
                    console.log('Charge inserted');

                }
            });
        });
    } catch (error) {
        console.error('Error retrieving charges:', error);
    }
    // setTimeout(retrieveAllCharges, 1000);
};

retrieveAllCharges();


app.post('/EMAILBEFOREPAY', (req, res) => {
    const EMAIL = req.body.EMAIL;
    const USERGENERATEDUNIQUEID = req.body.USERGENERATEDUNIQUEID;
    // Save the user data to the database
    con.query(`INSERT INTO charges (USEREMAILEMAIL,USERUNIQUEID) 
values ('${EMAIL}','${USERGENERATEDUNIQUEID}')`,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(data);
            }
        });
});

app.get('/CHARGES', (req, res) => {
    // Save the user data to the database
    con.query(`SELECT * FROM charges`,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(data);
            }
        });
});

app.get('/USERSIGNDATA', (req, res) => {
    con.query(`SELECT * FROM USERSIGNUPDATA`,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(data);
            }
        });
});



app.post("/VIDEO", VIDEO.array('VIDEO'), (req, res, next) => {

    const TITLE = req.body.TITLE;
    const VIDEO = req.files[0].filename;
    const DESTINATION = req.files[0].destination;

    // Define output file paths for each resolution
    const outputFile1080p = `${DESTINATION}${VIDEO}` + "_" + "1080p" + ".mp4";
    const outputFile720p = `${DESTINATION}${VIDEO}` + "_" + "720p" + ".mp4";
    const outputFile540p = `${DESTINATION}${VIDEO}` + "_" + "540p" + ".mp4";
    const outputFile360p = `${DESTINATION}${VIDEO}` + "_" + "360p" + ".mp4";


    // Create a new command using fluent-ffmpeg
    const command = ffmpeg();

    // Set input stream
    command.input(`${DESTINATION + VIDEO}`);

    // Set video codec to libx264 to maintain quality
    command.videoCodec('libx264');

    // Set a lower bitrate to reduce file size
    command.videoBitrate('800k');

    // Set audio codec to aac
    command.audioCodec('aac');

    // Set a lower audio bitrate to reduce file size
    command.audioBitrate('128k');

    // Set output file paths for each resolution
    command.output(outputFile1080p)
        .videoFilters('scale=w=1920:h=1080')
        .outputOptions('-c:a copy');
    command.output(outputFile720p)
        .videoFilters('scale=w=1280:h=720')
        .outputOptions('-c:a copy');
    command.output(outputFile540p)
        .videoFilters('scale=w=960:h=540')
        .outputOptions('-c:a copy');
    command.output(outputFile360p)
        .videoFilters('scale=w=640:h=360')
        .outputOptions('-c:a copy');

    // Run the command and log the output
    command.on('error', (err) => {
        console.error('An error occurred:', err.message);
    }).on('end', () => {
        console.log('Compression complete!');
        const INSERT_QUERY = `INSERT INTO USERVIDEOLIST (TITLE, VIDEOONE, VIDEOTWO, VIDEOTHREE, VIDEOFIVE) VALUES (?, ?, ?, ?, ?)`;
        const values = [TITLE, outputFile1080p, outputFile720p, outputFile540p, outputFile360p];
        con.query(INSERT_QUERY, values, (err, result) => {
            if (err) throw err;
            console.log("Video inserted into database");
            res.send("Video uploaded and compressed successfully");
        });
    }).run();

});


app.get('/USERVIDEOVIDEO', (req, res) => {
    con.query(`SELECT * FROM USERVIDEOLIST`,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(data);
            }
        });
});

app.get('/USERSUBSCRIBEDDATA', (req, res) => {
    con.query(`SELECT * FROM charges`,
        (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(data);
            }
        });
});



app.listen(process.env.PORT, () => {
    console.log("LISTENING TO PORT 3001");
});
