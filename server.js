
//Main server file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { hash } = require('crypto');
const authMiddleware = require('./module/authmidle');
const adminMidleware = require('./module/adminMidle');
const adminMiddleware = require('./module/adminMidle');
const { type } = require('os');
const fs = require('fs')
const https = require('https');
const Razorpay = require("razorpay");
const users_admin_Middle = require('./module/admin_users_Midle');
// const admin = require("firebase-admin");


const app = express();
app.use(express.static('public'))
// app.use(express.json());
app.use(bodyParser.json());


app.use(express.json());

// Initialize Firebase Admin SDK
// const serviceAccount = require("./firebase-adminsdk.json"); // Ensure the correct path

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });




app.use(cors({
    origin: "*", // Allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


const Time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

// MongoDB connection
// const mongoURI = "mongodb+srv://kick:kick@daa.0jeu1rr.mongodb.net/?retryWrites=true&w=majority&appName=DAA"
// const mongoURI = "mongodb+srv://durgansathleticsacademy:ysKUdccnJ5Q94ihU@as.tlrlypo.mongodb.net/?retryWrites=true&w=majority&appName=AS";
const mongoURI = "mongodb+srv://instasecur24:kick@flutterdata.cgalmbt.mongodb.net/?retryWrites=true&w=majority&appName=flutterdata"
mongoose.connect(mongoURI,)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));



const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


//https

// const key = fs.readFileSync('private.key')
// const cert = fs.readFileSync('certificate.crt')
// const cred = {
//   key,
//   cert
// }

// const httpsServer = https.createServer(cred, app)
// httpsServer.listen(443);

//https end

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/ip', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.send(`Your IP address is: ${ip}`);
});

const UsersSchema = new mongoose.Schema({

    Time: String,
    pass: String,
    email: String,
    username: String,
    name: String,
    valid: {
        default: "no",
        type: String
    }

});

const Usermodule = mongoose.model('pass', UsersSchema);


let transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: 'stawropuzzle@gmail.com',
        pass: 'osrz jhwt tcqx zeyf' // Be careful with your email password
    }
});


const user_s_otpSchema = new mongoose.Schema({
    Time: String,
    username: String,
    otp: String
}, { timestamps: true });

const User_s_OTP_module = mongoose.model('Users_OTP', user_s_otpSchema);


// const GoogleUser = require('./models/GoogleUser'); // already required


app.post('/post/google/auth', async (req, res) => {
  const { email, name, username, uid } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ Status: "INVALID_DATA", message: "Missing required fields." });
  }

  try {
    let user = await Usermodule.findOne({ email });

    if (user) {
      // User exists, proceed to login
      if (user.pass !== uid) {
        return res.status(401).json({ Status: "INVALID_UID", message: "UID does not match." });
      }

      const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", {
        expiresIn: "365 days"
      });

      return res.status(200).json({
        Status: "OK",
        message: "Login success",
        token,
        user: user._id,
        username: user.username
      });
    } else {
      // User not found, create new user
      const Time = new Date();

      user = await Usermodule.create({
        pass: uid,
        email,
        name,
        username,
        Time,
        valid: "yes"
      });

      const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", {
        expiresIn: "365 days"
      });

      return res.status(200).json({
        Status: "OK",
        message: "User created and logged in successfully",
        token,
        user: user._id,
        username: user.username
      });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ Status: "ERR_SERVER", message: "Internal server error." });
  }
});



app.post('/post/new/google/user', async (req, res) => {
  const { email, name, username, uid } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ Status: "INVALID_DATA", message: "Missing required fields." });
  }

  console.log(email, name, username, uid)

  try {
    // Check if user already exists
    let user = await Usermodule.findOne({ email });

    if (user) {
      return res.status(200).json({ Status: "OK", message: "User already exists. Login success." });
    }

    // Create new user
    user = await Usermodule.create({
      pass : uid,
      email,
      name,
      username,
      Time,
      valid : "yes"
    });

    return res.status(200).json({ Status: "OK", message: "User created successfully." });

  } catch (error) {
    console.error("Google Signup Error:", error);
    return res.status(500).json({ Status: "ERR_SERVER", message: "Internal server error." });
  }
});


app.post('/post/google/login', async (req, res) => {
    const { email, uid } = req.body;

    if (!email || !uid) {
        return res.status(200).json({ Status: "BAD", message: "Some Data Missing" });
    }

    try {
        // Check if Google user exists
        const user = await Usermodule.findOne({ email, pass : uid }).lean();

        if (!user) {
            return res.status(202).json({ Status: "NO" }); // Not found
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", { expiresIn: "365 days" });

        return res.status(200).json({
            Status: "OK",
            token,
            user: user._id,
            username: user.username
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.post('/post/new/user/data', async (req, res) => {
    const { pass, email, username, name } = req.body;

    try {
        if (!pass || !email || !username || !name) {
            return res.status(200).json({ Status: "ERR_MISSING_FIELDS", message: "All fields are required." });
        }

        if (!email.endsWith("@gmail.com")) {
            return res.status(200).json({ Status: "BAD_EML", message: "Only Gmail addresses are allowed." });
        }

        const [existingUserByEmail, existingOTP] = await Promise.all([
            Usermodule.findOne({ email }),
            User_s_OTP_module.findOne({ username })
        ]);

        // Clean up stale data
        if (existingOTP) await existingOTP.deleteOne();
        if (existingUserByEmail && existingUserByEmail.valid === "no") await existingUserByEmail.deleteOne();

        const [userByEmail, userByUsername] = await Promise.all([
            Usermodule.findOne({ email }).lean(),
            Usermodule.findOne({ username })
        ]);

        if (userByEmail && userByEmail.valid === "yes") {
            return res.status(200).json({ Status: "IN", message: "Email already exists." });
        }

        if (userByUsername) {
            return res.status(200).json({ Status: "UIN", message: "Username already in use." });
        }

        const hashedPass = await bcrypt.hash(pass, 10);
        const OTP = generateOTP();
        const Time = new Date();

        await Usermodule.create({ pass: hashedPass, email, username, name, Time });
        const otpData = await User_s_OTP_module.create({ Time, username, otp: OTP });

        let mailOptions = {
            from: 'stawropuzzle@gmail.com', // Sender address
            to: email, // List of recipients
            subject: `staWro, E-Mail Verification`, // Subject line
            text: 'staWro', // Plain text body
            html: `
            
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="refresh" content="30" />
                    <title>Document</title>
                    <style>
    
                        @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
    
    
                        .email-main-cnt-01{
                            width: 95%;
                            justify-content: center;
                            margin: auto;
                        }
    
                        .email-cnt-01{
                            width: 90%;
                            height: auto;
                            display: flex;
                            margin: 10px;
                        }
    
                        .email-cnt-01 div{
                            width: 50px;
                            height: 50px;
                            overflow: hidden;
                            border-radius: 50%;
                            border: 1px solid;
                            
                        }
    
                        .email-cnt-01 div img{
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
    
                        .email-cnt-01 strong{
                            font-family: Inknut Antiqua;
                            margin-left: 10px;
                        }
    
                        .email-cnt-btn-01{
                            width: 120px;
                            height: 30px;
                            margin: 10px;
                            color: aliceblue;
                            background-color: rgb(5, 148, 195);
                            border: 1px solid;
                            border-radius: 5px;
                            cursor: pointer;
                        }
    
    
                    </style>
                </head>
                <body>
                    <div class="email-main-cnt-01">
                        <div class="email-cnt-01">
                            <strong>stawro</strong>
                        </div>
                        <div class="email-cnt-02">
                            <span><strong>Verify Account ${username}</strong> </span><br/>
                            <p>Your Account need Attention to Verify<br />
                                By Authentication to New Account<br />
                                This is Your's OTP to Verify ${otpData.otp}<br />
                                Don't Share OTP</p>
                                
                            <strong>OTP ${otpData.otp}</strong><br/>
                 
                            <strong>Thank you</strong>
    
                        </div>
                    </div>
                    
                </body>
                </html>
    
            ` // HTML body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            return res.status(200).json({ Status: "OK-EML-VERI", message: "User registered successfully. OTP sent via email." });
        });




        

    } catch (error) {
        console.error("Error in", error);
        return res.status(500).json({ Status: "ERR_SERVER", message: "Internal Server Error." });
    }
});



// app.post('/post/new/user/data', async (req, res) => {
//     const { pass, email, username, name } = req.body;

//     try {

//         if(!pass && !email && !username && !name){
//             return res.status(500).json({ Status: "ERR_SERVER", message: "Some fields are missing" });
//         }


//         // Validate email format
//         if (!email.includes("@gmail.com")) {
//             return res.status(200).json({ Status: "BAD_EML", message: "Invalid email domain." });
//         }

//         // Check for existing user by email and OTP
//         const existingUserByEmail = await Usermodule.findOne({ email });
//         const existingOTP = await User_s_OTP_module.findOne({ username });

//         // Remove invalid users or stale OTPs
//         if (existingOTP) await existingOTP.deleteOne();
//         if (existingUserByEmail && existingUserByEmail.valid === "no") await existingUserByEmail.deleteOne();

//         // Check again for updated data
//         const userByEmail = await Usermodule.findOne({ email }).lean();
//         const userByUsername = await Usermodule.findOne({ username }).lean();

//         if (userByEmail && userByEmail.valid === "yes") {
//             return res.status(200).json({ Status: "IN", message: "This Email already exists." });
//         }

//         if (!userByEmail && !userByUsername) {
//             // Hash password and create user
//             const hash = await bcrypt.hash(pass, 10);

//             const OTP = generateOTP();

//             // Create user and OTP entries
//             await Usermodule.create({ pass: hash, email, username, name, Time });
//             const otpData = await User_s_OTP_module.create({ Time, username, otp: OTP });

//             // Prepare email
//             const mailOptions = {
//                 from: "stawropuzzle@gmail.com",
//                 to: email,
//                 subject: "Congratulations, your account has been successfully created on stawro.",
//                 html: `
//                     <html lang="en">

//                         <head>
//                             <meta charset="UTF-8">
//                             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                             <title>stawro Account Verification</title>
//                         </head>

//                         <body>
//                             <div>
//                                 <h2>Welcome to stawro, ${username}!</h2>
//                                 <p>Your account has been successfully created. Please verify your email using the OTP below:</p>
//                                 <h3>OTP: ${otpData.otp}</h3>
//                                 <p>After verification, you can access the login page by clicking the link below:</p>
//                                 <a href="https://www.stawro.com/login" target="_blank">Login</a>
//                                 <p>Thank you for joining us!</p>
//                             </div>
//                         </body>
//                     </html>
//                 `,
//             };

//             // Send email
//             transporter.sendMail(mailOptions, (error) => {
//                 if (error) {
//                     console.error("Error sending email:", error);
//                     return res.status(200).json({ Status: "EMAIL_ERR", message: "Failed to send email." });
//                 }

//                 return res.status(200).json({ Status: "OK-EML-VERI", message: "User registered successfully. OTP sent via email." });
//             });
//         } else {
//             return res.status(200).json({ Status: "UIN", message: "Username already in use." });
//         }
//     } catch (error) {
//         console.error("Error in /post/new/user/data:", error);
//         return res.status(500).json({ Status: "ERR_SERVER", message: "Internal Server Error." });
//     }
// });


app.post('/get/all/users/data/otp/to/verify/app', async (req, res) => {
    const { OTP, email } = req.body;

    try {

        if (!OTP && !email) return res.status(400).json({ Status: "BAD", message: "Invalid OTP or username." });


        // Find the user with the provided username
        const mainUser = await Usermodule.findOne({ email });
        const find_user = await User_s_OTP_module.findOne({ username: mainUser.username });

        // Check if user and OTP match
        if (find_user && find_user.otp === OTP) {
            // Update the user's valid status in the main user module

            if (mainUser) {
                mainUser.valid = "yes";
                await mainUser.save();
            }

            await find_user.deleteOne();
            // return res.status(200).json({ Status: "OK", message: "OTP verified successfully." });
            const token = jwt.sign({ id: mainUser._id }, "kanna_stawro_founders_withhh_1931_liketha", { expiresIn: "365 days" });
            res.status(200).json({ Status: "OK", token, user: mainUser._id, username: mainUser.username });

        } else {
            return res.status(400).json({ Status: "BAD", message: "Invalid OTP or username." });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});


app.post('/get/all/users/data/otp/to/verify', async (req, res) => {
    const { OTP, username } = req.body;

    try {

        if (!OTP && !username) return res.status(202).json({ Status: "BAD", message: "Invalid OTP or username." });

        // Find the user with the provided username
        const find_user = await User_s_OTP_module.findOne({ username });

        // Check if user and OTP match
        if (find_user && find_user.otp === OTP) {
            // Update the user's valid status in the main user module
            const mainUser = await Usermodule.findOne({ username });
            if (mainUser) {
                mainUser.valid = "yes";
                await mainUser.save();
            }

            // Delete the OTP record

            await find_user.deleteOne();

            return res.status(200).json({ Status: "OK", message: "OTP verified successfully." });
        } else {
            return res.status(200).json({ Status: "BAD", message: "Invalid OTP or username." });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});


app.post('/get/all/users/data/otp/to/verify/02', async (req, res) => {
    const { OTP, data } = req.body;

    try {
        // Find the user with the provided username

        if (!OTP && !data) return res.status(202).json({ Status: "BAD", message: "Invalid OTP or username." });

        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        });

        const find_user = await User_s_OTP_module.findOne({ username: user.username });

        // Check if user and OTP match
        if (find_user && find_user.otp === OTP) {
            // Update the user's valid status in the main user module
            const mainUser = await Usermodule.findOne({ email: user.email });
            if (mainUser) {
                mainUser.valid = "yes";
                await mainUser.save();
            }

            // Delete the OTP record

            await find_user.deleteOne();

            const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", { expiresIn: "365 days" });
            return res.status(200).json({ Status: "OK", token, user: user._id, username: user.username });

        }
        else {
            return res.status(200).json({ Status: "BAD", message: "Invalid OTP or username." });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
});

app.post('/get/new/otp/to/verify/app', async (req, res) => {
    try {
        const { data } = req.body;


        if (!data) {
            return res.status(400).json({ Status: "ERR", message: "Data is required." });
        }

        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        }).lean();

        if (!user) {
            return res.status(404).json({ Status: "ERR", message: "User not found." });
        }


        if (user.valid === "no") {
            const existingOTP = await User_s_OTP_module.findOne({ username: user.username });

            if (existingOTP) {
                await existingOTP.deleteOne();
            }


            const OTP = generateOTP();


            const otpData = await User_s_OTP_module.create({
                Time,
                username: user.username,
                otp: OTP
            });


            let mailOptions = {
                from: "stawropuzzle@gmail.com",
                to: user.email,
                subject: "Resend OTP for Account Verification",
                html: `
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>stawro Account Verification</title>
                    </head>
                    <body>
                        <div>
                            <h2>Hello ${user.username},</h2>
                            <p>Your OTP for email verification is:</p>
                            <h3>${otpData.otp}</h3>
                            <p>Please use this OTP to complete your account verification.</p>
                            <p>Thank you for choosing stawro!</p>
                        </div>
                    </body>
                </html>
                `,
            };


            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return res.status(500).json({ Status: "EMAIL_ERR", message: "Failed to send email." });
                }

                return res.status(200).json({ Status: "OK", message: "OTP resent successfully." });
            });


        } else {
            return res.status(400).json({ Status: "ERR", message: "User is already verified." });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ Status: "ERR", message: "Internal Server Error." });
    }
});





app.post('/get/new/otp/to/verify', async (req, res) => {
    const { data } = req.body;
    try {

        if (!data) return res.status(400).json({ message: "Some Data Missing" })
        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        }).lean();
        const OTP = generateOTP();
        if (user.valid === "no") {
            const otp_get = await User_s_OTP_module.findOne({ username: user.username })
            if (otp_get) {
                await otp_get.deleteOne();
            } else {
                const otpData = await User_s_OTP_module.create({ Time, username: user.username, otp: OTP });

                let mailOptions = {
                    from: "stawropuzzle@gmail.com",
                    to: user.email,
                    subject: "Congratulations, your account has been successfully created on stawro.",
                    html: `
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>stawro Account Verification</title>
                        </head>
                        <body>
                            <div>
                                <h2>Welcome to stawro, ${user.username}!</h2>
                                <p>Your account has been successfully created. Please verify your email using the OTP below:</p>
                                <h3>OTP: ${otpData.otp}</h3>
                                <p>After verification, you can access the login page by clicking the link below:</p>
                                <a href="https://www.stawro.com/login" target="_blank">Login</a>
                                <p>Thank you for joining us!</p>
                            </div>
                        </body>
                    </html>
                    `,
                };

                // Send email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Error sending email:", error);
                        return res.status(200).json({ Status: "EMAIL_ERR", message: "Failed to send email." });
                    }

                    return res.status(200).json({ Status: "OK", message: "User registered successfully. OTP sent via email." });
                });

            }
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ message: "Internal Server Error." });
    }
})

const BalanceSchema = new mongoose.Schema({
    Time: String,
    user: String,
    balance: String,
}, { timestamps: true });

const Balancemodule = mongoose.model('Balance', BalanceSchema);

const FCMSchema = new mongoose.Schema({
    Time: String,
    user: String,
    email: String,
    FCM: String,
    user_id: String
}, { timestamps: true });

const FCMModule = mongoose.model('FCM_Users', FCMSchema);


app.post("/logout/data/app", async (req, res) => {
    const { data } = req.body;
    try {
        if (!data) return res.status(400).json({ message: "Some Data Missing" })

        const get_data = await FCMModule.findOne({ user_id: data })
        if (get_data) {
            get_data.FCM = "";
            await get_data.save();
            return res.status(200).json({ Status: "OK" })
        } else {
            const user = await Usermodule.findOne({ _id: data }).lean()
            if (user) {
                await FCMModule.create({ Time: new Date(), user: user.username, email: user.email, FCM: "", user_id: user._id });
                return res.status(200).json({ Status: "OK" })
            }
            return res.status(200).json({ message: "No User Exist From This" })
        }


    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})













app.post('/login/data/app', async (req, res) => {
    const { data, pass, FCM } = req.body;

    try {

        if (!data && !pass && !FCM) return res.status(400).json({ message: "Some Data Missing" })

        // Find user by email or username

        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        }).lean();

        if (!user) {
            return res.status(402).json({ Status: "NO", message: "User not found" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(pass, user.pass);
        if (!isMatch) {
            return res.status(401).json({ Status: "BAD", message: "Invalid password" });
        }

        if (user.valid !== "yes") {
            await User_s_OTP_module.deleteOne({ username: user.username });

            const OTP = generateOTP();


            const otpData = await User_s_OTP_module.create({
                Time,
                username: user.username,
                otp: OTP
            });

            const mailOptions = {
                from: "stawropuzzle@gmail.com",
                to: user.email,
                subject: "Resend OTP for Account Verification",
                html: `
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>stawro Account Verification</title>
                    </head>
                    <body>
                        <div>
                            <h2>Hello ${user.username},</h2>
                            <p>Your OTP for email verification is:</p>
                            <h3>${otpData.otp}</h3>
                            <p>Please use this OTP to complete your account verification.</p>
                            <p>Thank you for choosing stawro!</p>
                        </div>
                    </body>
                </html>`
            };

            try {
                await transporter.sendMail(mailOptions);
                return res.status(403).json({ Status: "NO-YES", user: user.username, email: user.email });
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                return res.status(500).json({ Status: "EMAIL_ERR", message: "Failed to send email." });
            }
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", { expiresIn: "365 days" });

        // Update or create FCM token
        await FCMModule.findOneAndUpdate(
            { user: user.username },
            { Time, user: user.username, email: user.email, FCM, user_id: user._id },
            { upsert: true, new: true }
        );

        // Successful response
        return res.status(200).json({ Status: "OK", token, user: user._id, username: user.username });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});












// app.post('/login/data/app', async (req, res) => {
//     const { data, pass, FCM } = req.body;

//     try {
//         // Find user by email or username
//         const user = await Usermodule.findOne({
//             $or: [{ username: data.trim() }, { email: data.trim() }]
//         });

//         if (!user) {
//             return res.status(402).json({ Status: "NO" }); // User not found
//         }

//         if (user.valid !== "yes") {

//             const existingOTP = await User_s_OTP_module.findOne({ username: user.username });

//             if (existingOTP) {
//                 await existingOTP.deleteOne();
//             }


//             const OTP = generateOTP();
//             const Time = new Date(); // Ensure Time is defined


//             const otpData = await User_s_OTP_module.create({
//                 Time,
//                 username: user.username,
//                 otp: OTP
//             });


//             let mailOptions = {
//                 from: "stawropuzzle@gmail.com",
//                 to: user.email,
//                 subject: "Resend OTP for Account Verification",
//                 html: `
//                 <html lang="en">
//                     <head>
//                         <meta charset="UTF-8">
//                         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                         <title>stawro Account Verification</title>
//                     </head>
//                     <body>
//                         <div>
//                             <h2>Hello ${user.username},</h2>
//                             <p>Your OTP for email verification is:</p>
//                             <h3>${otpData.otp}</h3>
//                             <p>Please use this OTP to complete your account verification.</p>
//                             <p>Thank you for choosing stawro!</p>
//                         </div>
//                     </body>
//                 </html>
//                 `,
//             };


//             // Send email
//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error("Error sending email:", error);
//                     return res.status(500).json({ Status: "EMAIL_ERR", message: "Failed to send email." });
//                 }

//                 return res.status(403).json({ Status: "NO-YES", user: user.username, email : user.email }); // User not verified

//             });




//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(pass, user.pass);
//         if (!isMatch) {
//             return res.status(401).json({ Status: "BAD", message: "Invalid password" });
//         }

//         // Generate token
//         const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", { expiresIn: "365 days" });

//         // Update or create FCM token
//         let data_fcm = await FCMModule.findOne({ user: user.username });
//         if (data_fcm) {
//             data_fcm.FCM = FCM;
//             await data_fcm.save();
//         } else {
//             await FCMModule.create({ Time: new Date(), user: user.username, email: user.email, FCM, user_id : user._id });
//         }

//         // Successful response
//         res.status(200).json({ Status: "OK", token, user: user._id, username: user.username });

//     } catch (error) {
//         console.error("Login Error:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });


//login and token



app.post('/login/data', async (req, res) => {
    const { data, pass } = req.body;
    try {

        if (!data && !pass) return res.status(200).json({ Status: "BAD", message: "Some Data Missing" })

        // Check if the data is an email or username
        // Find user by email or username
        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        }).lean();

        if (user && user.valid === "yes") {
            bcrypt.compare(pass, user.pass, (err, response) => {
                if (response) {
                    const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha", { expiresIn: "365 days" });
                    res.json({ Status: "OK", token, user: user._id, username: user.username });
                }
                else {
                    console.log(err)
                    return res.json({ Status: "BAD" });
                }
            })
        } else if (user && user.valid !== "yes") {
            return res.status(202).json({ Status: "NO-YES", user: user.username });
        }
        else {
            return res.status(202).json({ Status: "NO" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.post("/pass/send/requests", async (req, res) => {
    const { data } = req.body;
    try {
        if (!data) return res.status(200).json({ Status: "BAD", message: "Some Data Missing" })

        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        }).lean();

        if (user) {
            const token = jwt.sign({ id: user._id }, "kanna_stawro_founders_withhh_1931_liketha_pass-worff", { expiresIn: "5m" });

            let mailOptions = {
                from: 'stawropuzzle@gmail.com', // Sender address
                to: `${user.email}`, // List of recipients
                subject: `stawro, Change Password`, // Subject line
                text: '', // Plain text body
                html: `
                
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="refresh" content="30" />
                        <title>Document</title>
                        <style>
        
                            @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
        
        
                            .email-main-cnt-01{
                                width: 95%;
                                justify-content: center;
                                margin: auto;
                            }
        
                            .email-cnt-01{
                                width: 90%;
                                height: auto;
                                display: flex;
                                margin: 10px;
                            }
        
                            .email-cnt-01 div{
                                width: 50px;
                                height: 50px;
                                overflow: hidden;
                                border-radius: 50%;
                                border: 1px solid;
                                
                            }
        
                            .email-cnt-01 div img{
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
        
                            .email-cnt-01 strong{
                                font-family: Inknut Antiqua;
                                margin-left: 10px;
                            }
        
                            .email-cnt-btn-01{
                                width: 120px;
                                height: 30px;
                                margin: 10px;
                                color: aliceblue;
                                background-color: rgb(5, 148, 195);
                                border: 1px solid;
                                border-radius: 5px;
                                cursor: pointer;
                            }
        
        
                        </style>
                    </head>
                    <body>
                        <div class="email-main-cnt-01">
                            <div class="email-cnt-01">
                                <strong>stawro</strong>
                            </div>
                            <div class="email-cnt-02">
                                <span>Hello, Dear <strong>${user.username}</strong> </span><br/>
                                <p>Welcome to stawro.<br/>
                                Change to a new password by clicking on the 'Update' text</p><br/>
                                    <a href = "https://www.stawro.com/changepass?id=${token}&user=${user._id}" style="text-decoration: none;">Update</a>
                                <strong></strong><br/>
                     
                                <strong>Thank you</strong>
        
                            </div>
                        </div>
                        
                    </body>
                    </html>
        
                ` // HTML body
            };

            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(202).json({ message: "Something went Wrong" })
                }
                return res.status(200).json({ Status: "OK" })
            });


        } else {
            return res.status(202).json({ Status: "NO" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.post("/update/password/without/token", async (req, res) => {
    const { pass, oldpass, user } = req.body;
    try {
        if (!pass && !oldpass && !user) return res.status(200).json({ Status: "BAD", message: "Some Data Missing" })

        // MONGOOSE
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const data = await Usermodule.findOne({ _id: user });

        if (!data) {
            return res.status(404).json({ status: "User Not Found" });
        }


        const isMatch = await bcrypt.compare(oldpass, data.pass);
        if (isMatch) {
            const hash = await bcrypt.hash(pass, 10);
            data.pass = hash;
            data.Time = Time; // Assuming you want to set the current date/time
            await data.save();
            return res.status(200).json({ Status: "OK" });
        } else {
            return res.status(202).json({ Status: "NO" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/update/new/pass/by/token", async (req, res) => {
    const { pass, token, id } = req.body;

    try {

        if (!pass && !token && id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {  // Ensure valid ObjectId for findById
            return res.status(400).json({ Status: "NO Token", success: false, message: "Invalid ObjectId format" });
        }

        if (token) {
            const decoded = jwt.verify(token, 'kanna_stawro_founders_withhh_1931_liketha_pass-worff');

            if (decoded.id === id) {
                const User = await Usermodule.findById({ _id: decoded.id })
                if (!User) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })
                const hash = await bcrypt.hash(pass, 10);

                // Update the user's password and time
                User.pass = hash;
                User.Time = Time;
                await User.save();
                return res.status(200).json({ Status: "OK" })

            }
            else {
                console.log({ Status: "NOT VALID" })
                return res.status(202).json({ Status: "NO Token" });

            }

        } else {
            return res.status(202).json({ Status: "NO Token" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})




app.post('/get/balance/new/data', authMiddleware, async (req, res) => {
    const { user } = req.body;

    try {

        if (!user) return res.status(400).json({ message: "Some Data missing" })


        const data = await Balancemodule.findOne({ user: user })
        if (!data) {
            await Balancemodule.create({ user, Time, balance: "5" });
            await Historymodule.create({ Time, user, rupee: "5", type: "Credited", tp: "Rupee" });
            const data1 = StarBalmodule.findOne({ user }).lean()
            if (data1) {
                return res.status(200).json({ Status: "OK" });
            } else {
                await Historymodule.create({ Time, user, rupee: "1", type: "Credited", tp: "Stars" });
                await StarBalmodule.create({ Time, user, balance: "1" });
                return res.status(200).json({ Status: "OK" });
            }

        } else {
            return res.status(202).json({ Status: "NO" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.get("/get/acount/balence/:user", authMiddleware, async (req, res) => {
    const user = req.params.user;

    try {

        if (!user) return res.status(400).json({ Status: "NO", message: "Some Data Missing" })

        const data = await Balancemodule.findOne({ user: user }).lean();
        if (data) {
            console.log(data)
            return res.status(200).json({ data })
        } else {
            return res.status(202).json({ Status: "NO" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const HistorySchema = new mongoose.Schema({

    Time: String,
    user: String,
    rupee: String,
    type: String,
    tp: String,

});


const Historymodule = mongoose.model('History', HistorySchema);


app.get('/update/data/:user', async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "NO", message: "Some Data Missing" })

        const data = await Historymodule.find({ user: user }).lean();
        if (data) {
            return res.status(200).json({ data: data.reverse() });
        } else {
            return res.status(400).json({ message: "Error" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const UPI_BANKSchema = new mongoose.Schema({
    Time: String,
    user: String,
    ac_h_nme: String,
    bank_nme: {
        default: "No",
        type: String
    },
    Acc_no: String,
    ifsc: {
        default: "No",
        type: String
    },
    app: {
        default: "No",
        type: String
    },
    type: String

}, { timestamps: true });

const UPImodule = mongoose.model('Baank_UPI', UPI_BANKSchema);

app.post("/bank/upi/data/collect", authMiddleware, async (req, res) => {
    const { user, ac_h_nme, bank_nme, Acc_no, ifsc, app, type } = req.body;
    try {

        if (!user && !ac_h_nme && !bank_nme && !Acc_no && !ifsc && !app && !type) return res.status(400).json({ Status: "NO", message: "Some Data Missing" })

        const data = await UPImodule.findOne({ user: user }).lean()

        if (!data) {
            await UPImodule.create({ user, ac_h_nme, bank_nme, Acc_no, ifsc, app, type })
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "IN" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get("/get/bank/account/data/:user", authMiddleware, async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "NO", message: "Some Data Missing" })

        const data = await UPImodule.findOne({ user: user }).lean()
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(202).json({ Status: "No" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



const CoinSchema = new mongoose.Schema({
    Time: String,
    title: String,
    img: String,
    valid: String,
    body: String,
    stars: String,
}, { timestamps: true });

const Coinmodule = mongoose.model('Coins', CoinSchema);

app.post("/coin/new/data", async (req, res) => {
    const { title, img, valid, body, stars } = req.body;
    try {
        if (!title && !img && !valid && !body && !stars) return res.status(400).json({ Status: "NO", message: "Some Data Missing" })

        await Coinmodule.create({ title, img, valid, body, stars, Time });
        return res.status(202).json({ Status: "OK" })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/coin/data", async (req, res) => {
    try {
        const data = await Coinmodule.find({}).lean();
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(400).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/coin/data/2", adminMidleware, async (req, res) => {
    try {
        const data = await Coinmodule.find({}).lean()
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(400).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.delete("/delete/coin/by/:id", async (req, res) => {
    const id = req.params.id;
    try {
        if (!id) return res.status(400).json({ Status: "NO", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const data = await Coinmodule.findById(id)
        if (data) {
            await data.deleteOne();
            return res.status(202).json({ Status: "OK" })
        } else {
            return res.status(202).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const MyCoinsSchema = new mongoose.Schema({
    Time: String,
    title: String,
    img: String,
    valid: String,
    body: String,
    stars: String,
    type: String,
    user: String
}, { timestamps: true });

const Mycoinsmodule = mongoose.model('My_Coins', MyCoinsSchema);



app.post('/get/my/conis/get', authMiddleware, async (req, res) => {
    const { id, user } = req.body;
    try {

        if (!id && !user) return res.status(200).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }
        const data = await Coinmodule.findById({ _id: id }).lean()
        const data1 = await StarBalmodule.findOne({ user })

        if (data && data1) {
            if (parseInt(data1.balance) >= parseInt(data.stars)) {
                const sum = parseInt(data1.balance) - parseInt(data.stars);
                // await StarBalmodule.create({Time, user, balance : "2"});
                await data1.updateOne({ balance: sum })
                //coins to my coins
                await Mycoinsmodule.create({ Time, title: data.title, img: data.img, valid: data.valid, body: data.body, stars: data.stars, type: "Stars", user })
                await Historymodule.create({ Time, user, rupee: data.stars, type: "Debited", tp: "Stars" });
                return res.status(200).json({ Status: "OK" })
            }
            else {
                return res.status(202).json({ Status: "Low Bal", message: "Low Balance" })
            }

        } else if (!data1) {
            await StarBalmodule.create({ Time, user, balance: "2" });
            // History
            await Historymodule.create({ Time, user, rupee: "2", type: "Credited", tp: "Stars" });
            return res.status(202).json({ Status: "Low Bal" })
        } else {
            return res.status(301).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.get('/get/coins/data/by/id/:user', authMiddleware, async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await Mycoinsmodule.find({ user }).lean()
        if (data) {
            return res.status(200).json({ data })

        } else {
            return res.status(200).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/get/coins/data/length/to/app/:user', authMiddleware, async (req, res) => {
    const user = req.params.user;

    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await Mycoinsmodule.find({ user }).lean()
        if (data) {
            return res.status(200).json({ data: data.length })
        } else {
            return res.status(201).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }


})

const StarBalSchema = new mongoose.Schema({
    Time: String,
    user: String,
    balance: String,
}, { timestamps: true });

const StarBalmodule = mongoose.model('Star_Bal', StarBalSchema);

app.get('/get/stars/balance/:user', authMiddleware, async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(200).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await StarBalmodule.findOne({ user }).lean()
        if (!data) {
            await StarBalmodule.create({ Time, user: user, balance: "2" });
            // History
            await Historymodule.create({ Time, user, rupee: "2", type: "Credited", tp: "Stars" });
            return res.status(200).json({ Status: "OKK" });
        } else {
            return res.status(200).json({ data });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const CliamReqSchema = new mongoose.Schema({
    Time: String,
    title: String,
    img: String,
    valid: String,
    body: String,
    stars: String,
    type: String,
    user: String,
    ID: String
}, { timestamps: true });

const Claimrequestmodule = mongoose.model('Claim_req_Coins', CliamReqSchema);


app.get("/get/coins/by/id/cupons/by/apps/:id", async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        let from = "Request";
        let data = await Claimrequestmodule.findOne({ ID: id }).lean(); // Using .lean() for performance boost

        if (!data) {
            from = "Claimed";
            if (!mongoose.Types.ObjectId.isValid(id)) {  // Ensure valid ObjectId for findById
                return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
            }
            data = await ClaimedCoinsmodule.findById(id).lean();
        }

        if (!data) {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

        return res.status(200).json({ success: true, data, from });

    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});





app.post('/claim/reqst/coins/admin', authMiddleware, async (req, res) => {
    const { user, id } = req.body
    try {
        if (!user && !id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }
        const Bougt_Coin = await Mycoinsmodule.findById({ _id: id })
        if (Bougt_Coin.user === user) {
            await Claimrequestmodule.create({
                Time,
                title: Bougt_Coin.title,
                img: Bougt_Coin.img,
                valid: Bougt_Coin.valid,
                body: Bougt_Coin.body,
                stars: Bougt_Coin.stars,
                type: Bougt_Coin.type,
                user: user,
                ID: Bougt_Coin._id
            })
            await PendingNotimodule.create({ Time, user, idd: Bougt_Coin._id, type: "Coin", title: Bougt_Coin.title, sub: "pending" })
            await Bougt_Coin.deleteOne();
            return res.status(200).json({ Status: "OK" })

        } else {
            return res.status(200).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get("/get/requested/coins/by/:user", authMiddleware, async (req, res) => {
    const user = req.params.user

    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await Claimrequestmodule.find({ user }).lean();
        if (data) {
            return res.status(200).json({ data });
        } else {
            return res.status(201).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/requested/coins/admin', adminMidleware, async (req, res) => {
    try {
        const data = await Claimrequestmodule.find({}).lean();

        if (!data || data.length === 0) {
            return res.status(200).json({ Status: "BAD", data: [] });
        }

        const Data = await Promise.all(
            data.map(async (item) => {
                const upi_bnk = await UPImodule.findOne({ user: item.user }).lean();
                return {
                    data: item,
                    bank: upi_bnk || null
                };
            })
        );

        return res.status(200).json({ data: Data });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.delete("/find/by/id/and/delete/req/coins/:id", async (req, res) => {
    const id = req.params.id;
    try {
        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const data = await Claimrequestmodule.findById({ _id: id })
        if (data) {
            await ClaimedCoinsmodule.create({
                Time,
                title: data.title,
                img: data.img,
                valid: data.valid,
                body: data.body,
                stars: data.stars,
                type: data.type,
                user: data.user
            })
            //Pending Notification
            //sub => pending or completed
            //type => Coin or Money
            await PendingNotimodule.findOneAndDelete({ idd: data.ID })
            await PendingNotimodule.create({ Time, user: data.user, idd: data._id, type: "Coin", title: data.title, sub: "completed" })
            await data.deleteOne();
            return res.status(202).json({ Status: "OK" })
        } else {
            return res.status(202).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const ClimedReqSchema = new mongoose.Schema({
    Time: String,
    title: String,
    img: String,
    valid: String,
    body: String,
    stars: String,
    type: String,
    user: String
}, { timestamps: true });

const ClaimedCoinsmodule = mongoose.model('Claimed_coins', ClimedReqSchema);

app.get('/get/claimed/from/pending/coins', async (req, res) => {
    try {
        const data = await ClaimedCoinsmodule.find({}).lean();
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(201).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/get/claimed/from/pending/coins/:user', authMiddleware, async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" });

        const data = await ClaimedCoinsmodule.find({ user }).lean();
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(201).json({ Status: "No" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

})



app.get('/get/claimed/from/pending/coins/app/:user', authMiddleware, async (req, res) => {
    const user = req.params.user;

    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await ClaimedCoinsmodule.find({ user }).lean();
        if (data) {
            return res.status(200).json({ data: data.length })
        } else {
            return res.status(201).json({ Status: "No" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



const PendingNotiSchema = new mongoose.Schema({

    Time: String,
    user: String,
    idd: String,
    type: String,
    title: String,
    sub: String

});

const PendingNotimodule = mongoose.model('Pending_Noti', PendingNotiSchema);

app.get('/get/pending/notification/:user', authMiddleware, async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await PendingNotimodule.find({ user }).lean();
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(400).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const AdminUserSchema = new mongoose.Schema({
    Time: String,
    username: String,
    pass: String,
}, { timestamps: true });

const AdminUsermodule = mongoose.model('Admin_Users', AdminUserSchema);

app.post('/get/new/user/admin/account', async (req, res) => {
    const { username, pass, quest, answ, id } = req.body;

    try {
        if (!username && !pass && !quest && !answ && !id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (quest === "Hero" && answ === "Ki1931cK" && id === "193100") {
            const hash = await bcrypt.hash(pass, 10)
            await AdminUsermodule.create({ Time, username, pass: hash, valid: "No" })
            return res.status(202).json({ Status: "OK" })
        } else {
            return res.status(202).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

})

const OTPSchema = new mongoose.Schema({
    Time: String,
    username: String,
    OTP: String,
}, { timestamps: true });

const OTPmodule = mongoose.model('OTP_Data', OTPSchema);



app.post('/login/to/admin/account', async (req, res) => {
    const { username } = req.body;
    try {
        if (!username) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" });

        const otp = generateOTP()
        const user = await AdminUsermodule.findOne({ username }).lean();
        if (user) {
            await OTPmodule.findOneAndDelete({ username: username })
            const data = await OTPmodule.create({ username, Time, OTP: otp })
            let mailOptions = {
                from: 'stawropuzzle@gmail.com', // Sender address
                to: "anvithapujari036@gmail.com", // List of recipients
                subject: `stawro, Admin Login OTP`, // Subject line
                text: '', // Plain text body
                html: `
                
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="refresh" content="30" />
                        <title>Document</title>
                        <style>
        
                            @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
        
        
                            .email-main-cnt-01{
                                width: 95%;
                                justify-content: center;
                                margin: auto;
                            }
        
                            .email-cnt-01{
                                width: 90%;
                                height: auto;
                                display: flex;
                                margin: 10px;
                            }
        
                            .email-cnt-01 div{
                                width: 50px;
                                height: 50px;
                                overflow: hidden;
                                border-radius: 50%;
                                border: 1px solid;
                                
                            }
        
                            .email-cnt-01 div img{
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
        
                            .email-cnt-01 strong{
                                font-family: Inknut Antiqua;
                                margin-left: 10px;
                            }
        
                            .email-cnt-btn-01{
                                width: 120px;
                                height: 30px;
                                margin: 10px;
                                color: aliceblue;
                                background-color: rgb(5, 148, 195);
                                border: 1px solid;
                                border-radius: 5px;
                                cursor: pointer;
                            }
        
        
                        </style>
                    </head>
                    <body>
                        <div class="email-main-cnt-01">
                            <div class="email-cnt-01">
                                <strong>stawro</strong>
                            </div>
                            <div class="email-cnt-02">
                                <span><strong>Login, Admin Account ${data.username}</strong> </span><br/>
                                <p>Your Account need Attention to Login<br />
                                    By Authentication to Admin Account<br />
                                    This is Your's OTP to Login ${data.OTP}<br />
                                    Don't Share OTP</p>
                                    
                                <strong>OTP ${data.OTP}</strong><br/>
                     
                                <strong>Thank you</strong>
        
                            </div>
                        </div>
                        
                    </body>
                    </html>
        
                ` // HTML body
            };

            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                return res.json({ Status: "OK" })
            });

            // if(user.valid === "Yes"){
            //     const dat = await bcrypt.compare(pass, user.pass)
            //     if(dat){
            //         const token = jwt.sign({ username : user.username }, "kanna_stawro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__", { expiresIn: "24h" });
            //         return res.status(202).json({Status : "OK", token })
            //     }else{
            //         return res.status(202).json({Status : "BAD"})
            //     }
            // }else{
            //     return res.status(202).json({Status : "BAD"})
            // }


        } else {
            return res.status(202).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


// app.post('/verify/otp/and/pass/by/admin', async (req, res) =>{
//     const {otp, username,pass} = req.body;
//     try{
//         const data = await OTPmodule.findOne({username})
//         if(data.OTP === otp){
//             await data.deleteOne();
//             const user = await AdminUsermodule.findOne({username})
//             if(user.username === username){
//                 const True = await bcrypt.compare(pass, user.pass)
//                 if(True){                    
//                     const token = jwt.sign({ username : username }, "kanna_stawro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__", { expiresIn: "24h" });
//                     return res.status(202).json({Status : "OK", token})
//                 }else{
//                     return res.status(202).json({Status : "BAD"})
//                 }
//             }else{
//                 return res.status(202).json({Status : "BAD"})
//             }

//         }else{
//             return res.status(202).json({Status : "BAD"})
//         }
//     }catch(error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// })


// app.post('/verify/otp/and/pass/by/admin', async (req, res) => {
//     const { otp, username, pass } = req.body;
//     try {
//         const data = await OTPmodule.findOne({ username });
//         if (data && data.OTP === otp) {
//             await data.deleteOne();
//             const user = await AdminUsermodule.findOne({ username });
//             if (user && user.username === username) {
//                 const isPasswordCorrect = bcrypt.compare(pass, user.pass);
//                 if (isPasswordCorrect) {
//                     const token = jwt.sign(
//                         { username: username },
//                         "kanna_stawro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__",
//                         { expiresIn: "24h" }
//                     );
//                     return res.status(202).json({ Status: "OK", token });
//                 } else {
//                     return res.status(202).json({ Status: "BAD", message: "Invalid password" });
//                 }
//             } else {
//                 return res.status(202).json({ Status: "BAD", message: "User not found" });
//             }
//         } else {
//             return res.status(202).json({ Status: "BAD", message: "Invalid OTP" });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });


app.post('/verify/otp/and/pass/by/admin', async (req, res) => {
    const { otp, username, pass } = req.body;
    try {

        if (!otp && !username && !pass) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })
        // Verify OTP
        const data = await OTPmodule.findOne({ username });
        if (!data || data.OTP !== otp) {

            return res.status(200).json({ status: "BAD", message: "Invalid OTP" });
        }

        // OTP is valid, delete it
        await data.deleteOne();

        // Verify user credentials
        const user = await AdminUsermodule.findOne({ username }).lean();

        if (!user) {
            return res.status(200).json({ Status: "BAD" });
        }

        // const isPasswordCorrect = await bcrypt.compare(pass, user.pass);
        bcrypt.compare(pass, user.pass, (err, response) => {
            if (response) {
                // Generate JWT token
                const token = jwt.sign(
                    { username },
                    "kanna_stawro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__", // Use environment variable for secret key
                    { expiresIn: "24h" }
                );

                return res.status(200).json({ Status: "OK", token });
            } else {
                console.log(err)
                return res.status(200).json({ Status: "BAD" });
            }
        })




    } catch (error) {
        console.error("Error during OTP and password verification:", error);
        return res.status(500).json({ Status: "BAD", message: "Internal Server Error" });
    }
});


const RupeeSchema = new mongoose.Schema({
    Time: String,
    username: String,
    rupee: String,
}, { timestamps: true });

const Rupeemodule = mongoose.model('Rupee', RupeeSchema);

app.post('/rupee/get/for/game', async (req, res) => {
    const { rupee } = req.body;

    try {
        if (!rupee) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" });

        const username = "admin"

        const user = await Rupeemodule.findOne({ username })

        if (user) {
            await user.updateOne({ rupee: rupee })
            return res.status(200).json({ Status: "OK" })
        } else {
            await Rupeemodule.create({ rupee, username, Time })
            return res.status(200).json({ Status: "OK" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/rupee/data/play', async (req, res) => {
    try {
        const username = "admin";
        const data = await Rupeemodule.findOne({ username }).lean();

        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(400).json({ Status: "BAD" })
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const StartValidSchema = new mongoose.Schema({
    Time: String,
    user: String,
    valid: String
}, { timestamps: true });

const StartValidmodule = mongoose.model('Start_Valid', StartValidSchema);


app.get('/choose/question/start/game/:lang', async (req, res) => {
    const { lang, user } = req.params.body;
    try {

        if (!lang) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const Total_Questions = await QuestionModule.find({ lang: lang }).lean();

        if (!Total_Questions) return res.status(400).json({ Status: "BAD", message: "This Length not Found" });

        const sum = Total_Questions.length - 9;
        const specificNumbers = [];
        for (i = sum; i > 0; i -= 10) {
            specificNumbers.push(i);
        }
        const getRandomNumber = () => {
            const randomIndex = Math.floor(Math.random() * specificNumbers.length);
            return specificNumbers[randomIndex];
        };
        const num = getRandomNumber()
        const Array = [];
        const two = num + 10
        for (i = num; i < two; i++) {
            Array.push(i)
        }


    } catch (error) {
        console.log(error);
        // Send an error response
        return res.status(500).json({ message: "Internal Server Error" });
    }
})
















const QuestionListSchema = new mongoose.Schema({
    Time: String,
    user: String,
    lang: String,
    list: [],
    oldlist: [],
}, { timestamps: true });

const QuestionListmodule = mongoose.model('Question_List', QuestionListSchema);



// app.post('/start/playing/by/debit/amount', async (req, res) => {
//     const { user, lang } = req.body;
//     const Time = new Date(); // Assuming you want to store the current time

//     try {
//         // Find the user's balance
//         const balance = await Balancemodule.findOne({ user });
//         // Find the fees from the admin user
//         const fees = await Rupeemodule.findOne({ username: "admin" });

//         // Delete any existing start validation for the user
//         await StartValidmodule.findOneAndDelete({ user });

//         if (balance) {
//             // Check if the user's balance is sufficient
//             if (parseInt(balance.balance) >= parseInt(fees.rupee)) {
//                 const create_data = await QuestionListmodule.findOne({ user });

//                 if (create_data) {
//                     const QnoList = create_data.oldlist;
//                     const Total_Questions = await QuestionModule.find({ lang });

//                     // Calculate the starting points for random question selection
//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];

//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const Final = specificNumbers.filter(value => !QnoList.includes(value));

//                     if (Final.length <= 0) {
//                         return res.status(200).json({ Status: "BAD" });
//                     } else {
//                         const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                         // Update the user's balance
//                         await balance.updateOne({ balance: rem });

//                         // Create a new start validation and history record
//                         await StartValidmodule.create({ Time, user, valid: "yes" });
//                         await Totalusermodule.create({ Time, user });
//                         await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

//                         const getRandomNumber = () => {
//                             const randomIndex = Math.floor(Math.random() * Final.length);
//                             return Final[randomIndex];
//                         };

//                         const num = getRandomNumber();

//                         // Update question lists
//                         await QuestionListmodule.updateOne(
//                             { _id: create_data._id },
//                             { 
//                                 $push: { oldlist: num },
//                                 $set: { list: [] }
//                             }
//                         );

//                         const two = num + 10;
//                         for (let i = num; i < two; i++) {
//                             await QuestionListmodule.updateOne(
//                                 { _id: create_data._id },
//                                 { $push: { list: i } }
//                             );
//                         }

//                         return res.status(200).json({ Status: "OK" });
//                     }
//                 } else {
//                     const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                     // Update the user's balance
//                     await balance.updateOne({ balance: rem });

//                     // Create new start validation, history record, and question list
//                     await StartValidmodule.create({ Time, user, valid: "yes" });
//                     await Totalusermodule.create({ Time, user });
//                     await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

//                     const Question_list = await QuestionListmodule.create({ user, Time, lang, list: [], oldlist: [] });

//                     const Total_Questions = await QuestionModule.find({ lang });

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];
//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const getRandomNumber = () => {
//                         const randomIndex = Math.floor(Math.random() * specificNumbers.length);
//                         return specificNumbers[randomIndex];
//                     };

//                     const num = getRandomNumber();
//                     await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

//                     const two = num + 10;
//                     for (let i = num; i < two; i++) {
//                         await QuestionListmodule.updateOne(
//                             { _id: Question_list._id },
//                             { $push: { list: i } }
//                         );
//                     }

//                     return res.status(200).json({ Status: "OK" });
//                 }
//             } else {
//                 // Insufficient balance
//                 return res.status(200).json({ Status: "Low-Bal" });
//             }
//         } else {
//             // User not found
//             return res.status(200).json({ Status: "BAD" });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });



//main
// app.post('/start/playing/by/debit/amount', async (req, res) => {
//     const { user } = req.body;

//     try {

        

//         if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

//         const status = await Start_StopModule.findOne({ user: "kick" })
//         if (status.Status === "off") {
//             return res.status(200).json({ Status: "Time", message: status.text })
//         }


//         // Find the balance of the user
//         const lang_data = await LanguageSelectModule.findOne({ user }).lean()
//         const balance = await Balancemodule.findOne({ user });
//         // Find the fees from the admin user
//         const fees = await Rupeemodule.findOne({ username: "admin" }).lean();
//         // await StartValidmodule.findOneAndDelete({ user });


//         function main_bal() {
//             try {
//                 const get_bal = Balancemodule.findOne({ user });
//                 const create_data = QuestionListmodule.findOne({ user }).lean();

//                 if (parseInt(get_bal.balance) <= parseInt(fees.rupee)) {
//                     const lang_data = QuestionModule.distinct("sub_lang");
//                     const won_data = Wonmodule.countDocuments({ user });
//                     const total_play = Totalusermodule.countDocuments({ user });

//                     const get_per = (won_data / total_play) * 100;

//                     console.log(get_per)

//                     function get_new_list(tough){
//                         const new_num = []
//                         lang_data.map((data) =>{
//                             const get_num = QuestionModule.findOne({tough :  tough, sub_lang : data })
//                             new_num.push(get_num.qno)
//                             const i = parseInt(get_num.qno)
//                             QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { list: i } });
//                         })
//                     }

//                     if (get_per <= 0) {
                        
//                         QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
//                         get_new_list("Too Easy")
                    
//                     }
//                     else{

//                     }
//                 } else {
//                     console.log("User has enough balance");
//                 }
//             } catch (err) {
//                 console.error("Error in main_bal:", err);
//             }
//         }




//         if (balance) {
//             // Check if the user's balance is sufficient to cover the fees
//             if (parseInt(balance.balance) >= parseInt(fees.rupee)) {
//                 // Calculate the remaining balance


//                 const create_data = await QuestionListmodule.findOne({ user }).lean();
//                 if (create_data) {
//                     const QnoList = create_data.oldlist;

//                     const Total_Questions = await QuestionModule.find({ lang: lang_data.lang[0] }).lean();

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];

//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const Final = specificNumbers.filter(value => !QnoList.includes(value));

//                     if (Final.length <= 0) {
//                         return res.status(200).json({ Status: "BAD" });
//                     } 
                    
//                     else {
//                         const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                         // Update the user's balance
//                         await balance.updateOne({ balance: rem });

//                         // Get the current time

//                         // Create a new start record
//                         await StartValidmodule.create({ Time, user, valid: "yes" });
//                         await Totalusermodule.create({ Time, user });

//                         // Create a new history record
//                         await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });


//                         const getRandomNumber = () => {
//                             const randomIndex = Math.floor(Math.random() * Final.length);
//                             return Final[randomIndex];
//                         };
//                         const num = getRandomNumber();
//                         await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { oldlist: num } });
//                         // Clear the 'list' array
//                         await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });

//                         const two = num + 10;
//                         for (let i = num; i < two; i++) {
//                             await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { list: i } });
//                         }
//                         main_bal()

//                         return res.status(200).json({ Status: "OK" });
//                     }

//                 } else {

//                     const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                     // Update the user's balance
//                     await balance.updateOne({ balance: rem });

//                     // Get the current time
//                     // Create a new start record
//                     const ValDat = "yes";
//                     await StartValidmodule.create({ Time, user, valid: ValDat });
//                     await Totalusermodule.create({ Time, user });

//                     // Create a new history record
//                     await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });


//                     const Question_list = await QuestionListmodule.create({ user, Time, lang: lang_data.lang[0], list: [], oldlist: [] });

//                     const Total_Questions = await QuestionModule.find({ lang: lang_data.lang[0] }).lean();

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];
//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const getRandomNumber = () => {
//                         const randomIndex = Math.floor(Math.random() * specificNumbers.length);
//                         return specificNumbers[randomIndex];
//                     };

                    

//                     const num = getRandomNumber();
//                     await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

//                     const two = num + 10;
//                     for (let i = num; i < two; i++) {
//                         await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { list: i } });
//                     }



//                     main_bal()

//                     return res.status(200).json({ Status: "OK" });

//                 }

//             } else {

//                 // Send a response indicating low balance
//                 return res.status(200).json({ Status: "Low-Bal" });

//             }

//         } else {

//             // Send a response indicating that the user is not found
//             return res.status(200).json({ Status: "BAD" });
        
//         }
//     } catch (error) {

//         console.log(error);
//         // Send an error response
//         return res.status(500).json({ message: "Internal Server Error" });

//     }

// });



app.post('/start/playing/by/debit/amount', async (req, res) => {
    const { user } = req.body;

    if (!user) {
        return res.status(400).json({ Status: "BAD", message: "Some Data Missing" });
    }

    try {
        const status = await Start_StopModule.findOne({ user: "kick" });
        if (status?.Status === "off") {
            return res.status(200).json({ Status: "Time", message: status.text });
        }

        const lang_data = await LanguageSelectModule.findOne({ user }).lean();
        const balance = await Balancemodule.findOne({ user });
        const fees = await Rupeemodule.findOne({ username: "admin" }).lean();

        async function main_bal() {
            try {
                const get_bal = await Balancemodule.findOne({ user });
                const create_data = await QuestionListmodule.findOne({ user }).lean();

                if (!get_bal || !create_data) return;

                if (parseInt(get_bal.balance) <= parseInt(fees.rupee)) {
                    const lang_data_list = await QuestionModule.distinct("sub_lang");
                    const won_data = await Wonmodule.countDocuments({ user });
                    const total_play = await Totalusermodule.countDocuments({ user });

                    const get_per = total_play === 0 ? 0 : (won_data / total_play) * 100;
                    console.log("Win %:", get_per);

                    async function get_new_list(tough) {
                        for (const data of lang_data_list) {
                            const get_num = await QuestionModule.findOne({ tough, sub_lang: data }).lean();
                            if (get_num) {
                                const qno = parseInt(get_num.qno);
                                await QuestionListmodule.updateOne(
                                    { _id: create_data._id },
                                    { $push: { list: qno } }
                                );
                            }
                        }
                    }

                    if (get_per <= 0) {
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
                        await get_new_list("Too Easy");
                    }else if(get_per <= 10){
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
                        await get_new_list("Easy");
                    }
                    else if(get_per <= 20){
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
                        await get_new_list("Medium");
                    }
                } else {
                    // await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
                    console.log("User has enough balance");
                }
            } catch (err) {
                console.error("Error in main_bal:", err);
            }
        }

        if (!balance || parseInt(balance.balance) < parseInt(fees.rupee)) {
            return res.status(200).json({ Status: "Low-Bal" });
        }

        const rem = parseInt(balance.balance) - parseInt(fees.rupee);
        await balance.updateOne({ balance: rem });

        const Time = new Date();
        await StartValidmodule.create({ Time, user, valid: "yes" });
        await Totalusermodule.create({ Time, user });
        await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

        let create_data = await QuestionListmodule.findOne({ user }).lean();

        const Total_Questions = await QuestionModule.find({ lang: lang_data.lang[0] }).lean();
        const sum = Total_Questions.length - 9;
        const specificNumbers = [];

        for (let i = sum; i > 0; i -= 10) {
            specificNumbers.push(i);
        }

        const getRandomNumber = () => {
            const randomIndex = Math.floor(Math.random() * specificNumbers.length);
            return specificNumbers[randomIndex];
        };

        if (create_data) {
            const QnoList = create_data.oldlist || [];
            const Final = specificNumbers.filter(value => !QnoList.includes(value));

            if (Final.length <= 0) {
                return res.status(200).json({ Status: "BAD" });
            }

            const num = Final.length > 1 ? getRandomNumber() : Final[0];
            await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
            await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { oldlist: num, list: { $each: Array.from({ length: 10 }, (_, i) => num + i) } } });

        } else {
            const Question_list = await QuestionListmodule.create({ user, Time, lang: lang_data.lang[0], list: [], oldlist: [] });

            const num = getRandomNumber();
            await QuestionListmodule.updateOne({ _id: Question_list._id }, {
                $push: {
                    oldlist: num,
                    list: { $each: Array.from({ length: 10 }, (_, i) => num + i) }
                }
            });
        }

        await main_bal();
        return res.status(200).json({ Status: "OK" });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});




app.post('/start/playing/by/debit/amount/app', async (req, res) => {
    const { user } = req.body;

    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const status = await Start_StopModule.findOne({ user: "kick" })
        if (status.Status === "off") {
            return res.status(200).json({ Status: "Time", message: status.text })
        }


        // Find the balance of the user
        const lang_data = await LanguageSelectModule.findOne({ user })
        const balance = await Balancemodule.findOne({ user });
        // Find the fees from the admin user
        const fees = await Rupeemodule.findOne({ username: "admin" }).lean();
        // await StartValidmodule.findOneAndDelete({ user });

        const create_data = await QuestionListmodule.findOne({ user });

        const Total_Questions = await QuestionModule.find({ lang: lang_data.lang[0] });
        if (Total_Questions.length < 9) {
            await lang_data.deleteOne();
            await create_data.deleteOne();
            return res.status(203).json({ Status: "No Language Data Found" })
        }

        if (balance) {
            // Check if the user's balance is sufficient to cover the fees
            if (parseInt(balance.balance) >= parseInt(fees.rupee)) {
                // Calculate the remaining balance



                if (create_data) {
                    const QnoList = create_data.oldlist;



                    const sum = Total_Questions.length - 9;
                    const specificNumbers = [];

                    for (let i = sum; i > 0; i -= 10) {
                        specificNumbers.push(i);
                    }

                    const Final = specificNumbers.filter(value => !QnoList.includes(value));

                    if (Final.length <= 0) {
                        return res.status(202).json({ Status: "BAD" });
                    } else {
                        const rem = parseInt(balance.balance) - parseInt(fees.rupee);

                        // Update the user's balance
                        await balance.updateOne({ balance: rem });

                        // Get the current time

                        // Create a new start record
                        await StartValidmodule.create({ Time, user, valid: "yes" });
                        await Totalusermodule.create({ Time, user });

                        // Create a new history record
                        await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });


                        const getRandomNumber = () => {
                            const randomIndex = Math.floor(Math.random() * Final.length);
                            return Final[randomIndex];
                        };
                        const num = getRandomNumber();
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { oldlist: num } });
                        // Clear the 'list' array
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });

                        const two = num + 10;
                        for (let i = num; i < two; i++) {
                            await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { list: i } });
                        }

                        return res.status(200).json({ Status: "OK" });
                    }
                } else {
                    const rem = parseInt(balance.balance) - parseInt(fees.rupee);

                    // Update the user's balance
                    await balance.updateOne({ balance: rem });

                    // Get the current time
                    // Create a new start record
                    const ValDat = "yes";
                    await StartValidmodule.create({ Time, user, valid: ValDat });
                    await Totalusermodule.create({ Time, user });

                    // Create a new history record
                    await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });


                    const Question_list = await QuestionListmodule.create({ user, Time, lang: lang_data.lang[0], list: [], oldlist: [] });

                    const Total_Questions = await QuestionModule.find({ lang: lang_data.lang[0] }).lean();

                    const sum = Total_Questions.length - 9;
                    const specificNumbers = [];
                    for (let i = sum; i > 0; i -= 10) {
                        specificNumbers.push(i);
                    }

                    const getRandomNumber = () => {
                        const randomIndex = Math.floor(Math.random() * specificNumbers.length);
                        return specificNumbers[randomIndex];
                    };

                    const num = getRandomNumber();
                    await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

                    const two = num + 10;
                    for (let i = num; i < two; i++) {
                        await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { list: i } });
                    }

                    return res.status(200).json({ Status: "OK" });
                }
            } else {
                // Send a response indicating low balance
                return res.status(201).json({ Status: "Low-Bal" });
            }
        } else {
            // Send a response indicating that the user is not found
            return res.status(209).json({ Status: "BAD" });
        }
    } catch (error) {
        console.log(error);
        // Send an error response
        return res.status(500).json({ message: "Internal Server Error" });
    }
});






// app.post('/start/playing/by/debit/amount', async (req, res) => {
//     const { user, lang } = req.body;

//     try {
//         // Find the balance of the user
//         const balance = await Balancemodule.findOne({ user });
//         // Find the fees from the admin user
//         const fees = await Rupeemodule.findOne({ username: "admin" });
//         await StartValidmodule.findOneAndDelete({ user});

//         if (balance) {
//             // Check if the user's balance is sufficient to cover the fees
//             if (parseInt(balance.balance) >= parseInt(fees.rupee)) {


//                 // Calculate the remaining balance
//                 const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                 // Update the user's balance
//                 await balance.updateOne({ balance: rem });

//                 // Get the current time
//                 const Time = new Date();

//                 // Create a new start record
//                 await StartValidmodule.create({ Time, user, valid: "yes" });

//                 // Create a new history record
//                 await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

//                 const create_data = await QuestionListmodule.findOne({user})
//                 if(create_data){

//                     const QnoList = create_data.oldlist;



//                     const Total_Questions = await QuestionModule.find({lang : lang})

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];



//                     for (i = sum ; i > 0; i-=10){
//                         specificNumbers.push(i);            
//                     }

//                     const Ary = [1, 2, 3, 4]  

//                     const Final = specificNumbers.filter(value => !QnoList.includes(value) )

//                     if(Final.length < 0){

//                         return res.status(200).json({Status : "BAD"})

//                     }else{

//                         const getRandomNumber = () => {
//                             const randomIndex = Math.floor(Math.random() * Final.length);
//                             return Final[randomIndex];
//                         };
//                         const num = getRandomNumber()
//                         await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { oldlist: num } });
//                         //update a update epty [] to
//                         await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });

//                         const two = num+10
//                         for (i = num; i < two; i++){
//                             await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { list: i } });
//                         }

//                         return res.status(200).json({ Status: "OK" });
//                     }


//                 }else{
//                     const Question_list = await QuestionListmodule.create({ user, Time, lang, list: [], oldlist: [] });

//                     const Total_Questions = await QuestionModule.find({ lang: lang });

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];
//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const getRandomNumber = () => {
//                         const randomIndex = Math.floor(Math.random() * specificNumbers.length);
//                         return specificNumbers[randomIndex];
//                     };

//                     const num = getRandomNumber();
//                     await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

//                     const two = num + 10;
//                     for (let i = num; i < two; i++) {
//                         await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { list: i } });
//                     }

//                     return res.status(200).json({ Status: "OK" });


//                 }


//                 // Send a success response
//                 // return res.status(200).json({ Status: "OK"});
//             } else {
//                 // Send a response indicating low balance
//                 return res.status(200).json({ Status: "Low-Bal" });
//             }
//         } else {
//             // Send a response indicating that the user is not found
//             return res.status(200).json({ Status: "BAD" });
//         }
//     } catch (error) {
//         console.log(error);
//         // Send an error response
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });








app.delete("/delete/by/user/id/for/valid/data/:user", async (req, res) => {
    const user = req.params.user;

    try {
        if (!user) return res.status(400).json({ Status: 400, message: "Some Data Missing" })

        const data = await StartValidmodule.findOne({ user });

        if (data) {
            await data.deleteOne();
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/admin/get/all/users/data/logined", adminMiddleware, async (req, res) => {
    try {
        // Fetch all records from StartValidmodule
        const records = await StartValidmodule.find({}).lean();

        // Map through records and fetch corresponding user data
        const users = await Promise.all(records.map(async (record) => {

            const user = await Usermodule.findOne({ _id: record.user });

            if (!user) {
                return { username: "Unknown User", time: record.Time };
            }

            return {
                username: user.username,
                time: record.Time
            };
        }));

        // Send the gathered data
        return res.status(200).json({ users });
    } catch (error) {
        // Log the error with context
        console.error("Error fetching user data:", error);

        // Send a generic error message to the client
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



const QnoSchema = new mongoose.Schema({
    Time: String,
    user: String,
    img: String,
    Questio: String,
    qno: String,
    a: String,
    b: String,
    c: String,
    d: String,
    Ans: String,
    lang: String,
    tough: String,
    seconds: String,
    sub_lang: {
        default: "",
        type: String
    },

    yes: {
        default: "",
        type: []
    },
    no: {
        default: "",
        type: []
    }

}, { timestamps: true });

const QuestionModule = mongoose.model('Qno_Count', QnoSchema);

app.post("/get/posted/count/questions", async (req, res) => {
    const { user, img, Questio, a, b, c, d, Ans, lang, tough, seconds } = req.body;

    try {
        if (!user && !img && !Questio && !a && !b && !c && !d && !Ans && !lang && !tough && !seconds) return res.status(400).json({
            Status: "BAD",
            message: "Some Data Missing"
        })
        const Qno_length = await QuestionModule.find({ lang }).lean()
        const hash = Ans.trim().toLowerCase();
        await QuestionModule.create({ Time, user, img, Questio, qno: Qno_length.length + 1, a, b, c, d, Ans: hash, lang, tough, seconds })
        return res.status(200).json({ Status: "OK", qno: Qno_length.length + 1 })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.get("/get/question/no/by/user/name/:user", authMiddleware, async (req, res) => {
    const user = req.params.user;
    try {

        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })


        // Fetch the user's validity status from StartValidmodule
        const Data = await StartValidmodule.findOne({ user }).lean();
        // Fetch the user's question list from QuestionListmodule
        const Get_Qno_info = await QuestionListmodule.findOne({ user }).lean();

        // Check if the user is valid and has a question list
        if (Data && Data.valid === "yes") {
            if (Get_Qno_info && Get_Qno_info.list.length > 0) {
                // Get the first question number from the list
                const QNO = Get_Qno_info.list[0];

                // Find the question in QuestionModule by its number and language
                const Qno = await QuestionModule.findOne({ qno: QNO, lang: Get_Qno_info.lang }).lean();

                if (Qno) {
                    // Construct the response data
                    const data = {
                        _id: Qno._id,
                        img: Qno.img,
                        Question: Qno.Questio,
                        Qno: Get_Qno_info.list.length - 1, // Calculates the position of the question
                        a: Qno.a,
                        b: Qno.b,
                        c: Qno.c,
                        d: Qno.d,
                        seconds: Qno.seconds
                    };

                    return res.status(200).json({ data });
                } else {
                    return res.status(404).json({ Status: "BAD" });
                }
            } else {
                return res.status(202).json({ Status: "BAD" });
            }
        } else {
            return res.status(202).json({ Status: "BAD" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const WonSchema = new mongoose.Schema({
    Time: String,
    user: String,
    no: String,
    ID: String
}, { timestamps: true });

const Wonmodule = mongoose.model('Won', WonSchema);


app.post('/verify/answer/question/number', authMiddleware, async (req, res) => {
    const { answer, user, id } = req.body;
    try {


        if (!answer && !user && !id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }


        const Answer_Verify = await QuestionModule.findById({ _id: id })
        const User_List = await QuestionListmodule.findOne({ user })
        if (Answer_Verify.Ans === answer) {
            if (User_List.list.length === 1 || User_List.list.length === 0) {
                await User_List.updateOne({ $pull: { list: User_List.list[0] } })
                const won = await Wonmodule.find({})
                const CuponDat = await Cuponmodule.findOne({ no: won.length + 1 })
                if (CuponDat) {
                    await Wonmodule.create({ Time, user, no: won.length + 1, ID: CuponDat._id })

                    await Mycoinsmodule.create({
                        Time: Time,
                        title: CuponDat.title,
                        img: CuponDat.img,
                        user: user,
                        type: CuponDat.type,
                        stars: "No",
                        body: CuponDat.body,
                        valid: CuponDat.valid
                    })
                    //ki1931ck add code here
                    const rank = toString(won.length + 1)
                    if (!Answer_Verify.yes.includes(user)) {
                        await Answer_Verify.updateOne({ $push: { yes: user } })
                        return res.status(200).json({ Status: "OKK", id: CuponDat._id, rank: rank });
                    } else {
                        return res.status(200).json({ Status: "OKK", id: CuponDat._id, rank: rank });
                    }



                } else {


                    await Wonmodule.create({ Time, user, no: won.length + 1, ID: "stars" })
                    const get_prize_list1 = await StarBalmodule.findOne({ user })

                    const starsValues = [];
                    const pushData = await StarsCountmodule.find({})
                    pushData.map((users) => {
                        starsValues.push(users.stars)
                    })


                    // const sum = parseInt(get_prize_list1.balance) + parseInt(get_count_data.stars)

                    if (get_prize_list1) {
                        for (const stars of starsValues) {
                            const get_count_data = await StarsCountmodule.findOne({ stars }).lean();

                            if (parseInt(get_count_data.count) >= parseInt(won.length + 1)) {
                                await get_prize_list1.updateOne({ balance: parseInt(get_prize_list1.balance) + parseInt(get_count_data.stars) })
                                await Historymodule.create({ Time, user, rupee: get_count_data.stars, type: "Credited", tp: "Stars" });
                                const rank = toString(won.length + 1)
                                if (!Answer_Verify.yes.includes(user)) {
                                    await Answer_Verify.updateOne({ $push: { yes: user } })
                                    return res.status(200).json({ Status: "STARS", stars: get_count_data.stars, rank: rank });
                                } else {
                                    return res.status(200).json({ Status: "STARS", stars: get_count_data.stars, rank: rank });
                                }

                            }
                        }

                    } else {
                        for (const stars of starsValues) {
                            const get_count_data = await StarsCountmodule.findOne({ stars }).lean();

                            if (parseInt(get_count_data.count) >= parseInt(won.length + 1)) {
                                await StarBalmodule.create({ Time, user: user, balance: get_count_data.stars });
                                await Historymodule.create({ Time, user, rupee: get_count_data.stars, type: "Credited", tp: "Stars" });
                                const rank = toString(won.length + 1)
                                if (!Answer_Verify.yes.includes(user)) {
                                    await Answer_Verify.updateOne({ $push: { yes: user } })
                                    return res.status(200).json({ Status: "STARS", stars: get_count_data.stars, rank: rank });
                                } else {
                                    return res.status(200).json({ Status: "STARS", stars: get_count_data.stars, rank: rank });
                                }

                            }
                        }

                        // await StarBalmodule.create({Time, user : user, balance : get_count_data.stars});
                        // await Historymodule.create({Time, user, rupee : get_count_data.stars, type : "Credited", tp : "Stars"});
                        // return res.status(200).json({Status : "STARS", stars : get_count_data.stars});
                    }

                }



            } else {
                await User_List.updateOne({ $pull: { list: User_List.list[0] } })
                //ki1931ck add code here
                if (!Answer_Verify.yes.includes(user)) {
                    await Answer_Verify.updateOne({ $push: { yes: user } })
                    return res.status(200).json({ Status: "OK" })
                } else {
                    return res.status(200).json({ Status: "OK" })
                }

            }

        } else {
            if (!Answer_Verify.no.includes(user)) {
                await Answer_Verify.updateOne({ $push: { no: user } })
                return res.status(200).json({ Status: "BAD" })
            } else {
                return res.status(200).json({ Status: "BAD" })
            }

        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



const CuponSchema = new mongoose.Schema({
    Time: String,
    title: String,
    img: String,
    valid: String,
    body: String,
    type: String,
    user: String,
    no: String
}, { timestamps: true });

const Cuponmodule = mongoose.model('Cupon_s', CuponSchema);

app.post("/get/new/cupon/for/neww/cupon", async (req, res) => {
    const { title, img, valid, body, type, user } = req.body;
    try {
        if (!title && !img && !valid && !body && !type && !user) return res.status(200).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await Cuponmodule.find({}).lean()
        if (data) {
            await Cuponmodule.create({ Time, title, img, valid, body, type, user, no: data.length + 1 })
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "BAD" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.get("/get/cupon/get/all/datas", async (req, res) => {
    try {
        const data = await Cuponmodule.find({}).lean();
        if (data) {
            return res.status(200).json({ data });
        } else {
            return res.status(200).json({ Status: "BAD" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.delete("/delete/cupon/s/by/id/:id", async (req, res) => {
    const id = req.params.id

    try {

        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const user = await Cuponmodule.findById({ _id: id })

        if (user) {
            await user.deleteOne()
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



app.get("/get/coin/cupons/sds/by/id/:id", async (req, res) => {
    const id = req.params.id;
    try {

        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const won = await Cuponmodule.findById({ _id: id }).lean()
        if (won) {
            return res.status(200).json({ data: won })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const TotalUserSchema = new mongoose.Schema({
    Time: String,
    user: String,
}, { timestamps: true });

const Totalusermodule = mongoose.model('Total_Users', TotalUserSchema);

app.get("/get/aal/tottttal/users", adminMiddleware, async (req, res) => {
    try {
        const users = await Totalusermodule.find({}).lean();
        if (users) {
            return res.status(200).json({ users });
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get("/get/total/users/by/winners/datas/all/one", async (req, res) => {
    try {
        // Fetch all users who are marked as winners
        const users = await Wonmodule.find({}).lean();

        if (users) {
            return res.status(200).json({ users });
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

        // Return the list of users

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/total/users/by/winners/datas/all", adminMiddleware, async (req, res) => {
    try {
        // Fetch all users who are marked as winners
        const users = await Wonmodule.find({}).lean();
        if (users) {
            return res.status(200).json({ users });
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

        // Return the list of users

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/singel/user/won/data/:no", async (req, res) => {
    const no = req.params.no;
    try {
        if (!no) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const user_data = await Wonmodule.findOne({ no: no }).lean()
        if (user_data) {
            const iinfo_data = await Usermodule.findOne({ _id: user_data.user }).lean()
            const data = {
                username: iinfo_data.username
            }
            return res.status(200).json({ data })
        } else {
            return res.status(200).json({ Status: "NO" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get("/users/name/and/more/get/:id", authMiddleware, async (req, res) => {
    const id = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const user = await Usermodule.findById({ _id: id }).lean();
        if (user) {

            const data = {
                username: user.username,
                name: user.name,
                email: user.email
            }

            return res.status(200).json({ data })

        }
        else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/exact/time/by/new', async (req, res) => {
    try {
        const now = new Date();

        // Extract year, month, and day
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = now.getDate().toString().padStart(2, '0');

        // Format the date as "YYYY-MM-DD"
        const formattedDate = `${year}-${month}-${day}`;

        return res.status(200).json({ formattedDate })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})




const Chart_LineSchema = new mongoose.Schema({
    Time: String,
    len: String,
}, { timestamps: true });

const ChartLinemodule = mongoose.model('Line_chart-1', Chart_LineSchema);

app.post("/length/and/calcul/ation/of/chart", adminMiddleware, async (req, res) => {
    try {
        // Define the current date
        const now = new Date();

        // Extract year, month, and day
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = now.getDate().toString().padStart(2, '0');

        // Format the date as "YYYY-MM-DD"
        const formattedDate = `${year}-${month}-${day}`;

        // Find the total number of users
        const len_find = await Totalusermodule.find({}).exec();

        // Find data for the specific date
        const Find_data = await ChartLinemodule.findOne({ Time: formattedDate }).exec();

        if (!Find_data) {
            // Create a new chart line entry if no data is found for the date
            await ChartLinemodule.create({ len: len_find.length, Time: formattedDate });
            return res.status(200).json({ Status: "OK" });
        } else {
            return res.status(200).json({ Status: "IN" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/data/for/linechart/01", async (req, res) => {
    try {
        const data = await ChartLinemodule.find({}).lean();
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/admin/all/question/lists/:lang', adminMiddleware, async (req, res) => {
    const lang = req.params.lang;
    try {
        if (!lang) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await QuestionModule.find({ lang }).lean();

        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const Stars_CountsSchema = new mongoose.Schema({
    Time: String,
    stars: String,
    count: String,
}, { timestamps: true });

const StarsCountmodule = mongoose.model('Stars_Counts', Stars_CountsSchema);


app.post("/stars/count/one/stars", async (req, res) => {
    const { stars, count } = req.body;
    try {

        if (!stars && !count) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const get_data = await StarsCountmodule.findOne({ stars: stars }).lean();
        if (get_data) {
            // Update the count for the found document
            await StarsCountmodule.updateOne(
                { stars: stars },
                { $set: { count: count, Time } }
            );
            return res.status(200).json({ Status: "OK" });
        } else {
            // Create a new document if none is found
            await StarsCountmodule.create({ stars, count, Time });
            return res.status(200).json({ Status: "OK" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.get("/stars/get/all/data/by/stars", async (req, res) => {
    try {
        const data = await StarsCountmodule.find({}).lean();
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/trial/get/data/:data", async (req, res) => {
    const data = parseInt(req.params.data);

    try {

        if (!data) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" });

        const starsValues = ["6", "5", "4", "3", "2", "1"];

        for (const stars of starsValues) {
            const get_count_data = await StarsCountmodule.findOne({ stars }).lean();

            if (parseInt(get_count_data.count) >= data) {
                return res.status(200).json({ Data: get_count_data.stars });
            }
        }

        return res.status(404).json({ message: "No matching data found" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


// app.get("/trial/get/data/:data", async (req, res)=>{
//     const data = req.params.data
//     try {

//         // Find the first document where count is greater than or equal to the specified value
//         const get_count_data6 = await StarsCountmodule.findOne({stars : "6"});
//         const get_count_data5 = await StarsCountmodule.findOne({stars : "5"});
//         const get_count_data4 = await StarsCountmodule.findOne({stars : "4"});
//         const get_count_data3 = await StarsCountmodule.findOne({stars : "3"});
//         const get_count_data2 = await StarsCountmodule.findOne({stars : "2"});
//         const get_count_data1 = await StarsCountmodule.findOne({stars : "1"});

//         if(parseInt(get_count_data6.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data6.stars})
//         }else if(parseInt(get_count_data5.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data5.stars})
//         }else if(parseInt(get_count_data4.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data4.stars})
//         }
//         else if(parseInt(get_count_data3.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data3.stars})
//         }else if(parseInt(get_count_data2.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data2.stars})
//         }else if(parseInt(get_count_data1.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data1.stars})
//         }else{
//             console.log("none")
//         }

//         // Return the result as a JSON response
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// })

// app.get("/get/all/users/usernames/by/id/to/update/balance", async (req, res) => {
//     try {
//         const users = await Usermodule.find({});
//         const usersList = users.map((data) => {
//             return {
//                 id: data._id,
//                 username: data.username,
//             };
//         });
//         return res.status(200).json({ users: usersList });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });


const Trans_UTR_Schema = new mongoose.Schema({
    Time: String,
    UTR: String,
}, { timestamps: true });

const UTRmodule = mongoose.model('UTR', Trans_UTR_Schema);

app.post("/post/utr/ids/by/admin", async (req, res) => {
    const { utr } = req.body;

    try {

        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const user = await UTRmodule.findOne({ UTR: utr }).lean()

        if (user) {
            return res.status(200).json({ Status: "BAD" })
        } else {
            await UTRmodule.create({ Time, UTR: utr })
            return res.status(200).json({ Status: "OK" })
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/question/one/by/:no/:lang', async (req, res) => {
    try {

        if (!req.params.lang && !req.params.no) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        // Use findOne to search for a question by both 'lang' and 'qno'
        const question = await QuestionModule.findOne({ lang: req.params.lang, qno: req.params.no }).lean();

        if (question) {
            return res.status(200).json({ question });
        }

        return res.status(404).json({ message: "Question not found" });  // 404 for not found
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


const Lang_SelSchema = new mongoose.Schema({
    Time: String,
    lang: [],
    user: String
}, { timestamps: true });

const LanguageSelectModule = mongoose.model('Language_select', Lang_SelSchema);


app.post('/get/language/datas/all', async (req, res) => {
    const { lang, user } = req.body;

    try {

        if (!lang && !user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const Users = await LanguageSelectModule.findOne({ user }).lean();
        if (!Users) {
            await LanguageSelectModule.create({ lang, user, Time })
            return res.status(200).json({ Status: "OK" });
        } else {
            return res.status(200).json({ Status: "IN" });
        }
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.get("/get/language/datas/all/get/:user", async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })
        const Users = await LanguageSelectModule.findOne({ user }).lean()
        if (Users) {
            return res.status(200).json({ Users })
        } else {
            return res.status(201).json({ Status: "IN" })
        }
    }

    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

})



app.delete('/get/language/datas/all/get/and/delete/:user', async (req, res) => {
    const user = req.params.user;
    try {
        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const Users = await LanguageSelectModule.findOne({ user })
        if (Users) {
            await Users.deleteOne();
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

// app.get('/get/languages/data/with/questions/:user', async (req, res) =>{
//     const user = req.params.user
//     try{
//         const users = await LanguageSelectModule.findOne({user : user})
//         const data = users.lang 
//         const selQue = await QuestionListmodule.find({})
//         return res.status(200).json({data})



//     }catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ message: "Internal Server Error"});
//     }
// })



app.delete('/delete/unwanted/questions/:id', async (req, res) => {
    const id = req.params.id

    try {
        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        await QuestionModule.findByIdAndDelete({ id })
        return res.status(200).json({ Status: "OK" })
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/languages/data/with/questions/:user', async (req, res) => {
    const user = req.params.user;
    try {

        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const users = await LanguageSelectModule.findOne({ user: user }).lean();

        if (!users) {
            return res.status(404).json({ Status: "BAD", message: "User not found" });
        }

        const data = users.lang; // The list of languages the user has selected

        // Find questions related to the user's selected languages
        const selQue = await QuestionModule.find({
            lang: { $in: data }
        }).lean();

        if (!selQue.length) {
            return res.status(404).json({ message: "No questions found for the selected languages" });
        }




        // Example: Filter questions with the difficulty 'Easy'
        const t1 = "Too Easy";
        const t2 = "Easy";
        const t3 = "Medium";
        const t4 = "Tough";
        const t5 = "Too Tough";

        const FDt = selQue.filter(q => [t5, t4, t3, t2, t1].includes(q.tough));
        // Filters all questions where difficulty is 'Easy'

        return res.status(200).json({ FDt });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});





const AllLanguagesSchema = new mongoose.Schema({
    Time: { type: Date, default: Date.now },  // Use Date for Time field
    lang: [{ type: String }]  // Define lang as an array of strings
}, { timestamps: true });

const AllLanguagemodule = mongoose.model('All_Languages', AllLanguagesSchema);

app.post("/add/all/admin/new/languages/data", async (req, res) => {
    const lang = req.body.lang;  // Assuming req.body contains 'lang'

    try {
        if (!lang) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const DataFind = await AllLanguagemodule.findOne({});

        if (!DataFind) {
            // If no document exists, create a new document with the provided language
            const newLanguageDoc = new AllLanguagemodule({ lang: [lang] });
            await newLanguageDoc.save();
            return res.status(200).json({ Status: "OK", message: "New language added successfully" });
        } else {
            // Check if the language already exists in the lang array
            if (DataFind.lang.includes(lang)) {
                return res.status(200).json({ Status: "IN", message: "Language already exists" });
            } else {
                // Add the new language to the lang array
                await DataFind.updateOne({ $push: { lang: lang } });
                return res.status(200).json({ Status: "OK", message: "Language added successfully" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/all/admin/new/languages/data", adminMiddleware, async (req, res) => {
    try {
        const DataFind = await AllLanguagemodule.findOne({}).lean();
        if (DataFind) {
            const Data = DataFind.lang
            return res.status(200).json({ Data });
        } else {
            return res.status(200).json({ Status: "BAD" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/all/admin/new/languages/data/user", authMiddleware, async (req, res) => {
    try {
        const DataFind = await AllLanguagemodule.findOne({}).lean();
        if (DataFind) {
            const Data = DataFind.lang
            return res.status(200).json({ Data });
        } else {
            return res.status(201).json({ Status: "BAD" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})




app.delete("/delete/all/selected/data/with/onley/one/:lang", async (req, res) => {
    const lang = req.params.lang;
    try {
        if (!lang) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const data = await AllLanguagemodule.findOne({ lang: lang })
        if (data) {
            await data.updateOne({ $pull: { lang: lang } })
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const razorpay = new Razorpay({
    key_id: "rzp_live_V4tRMNPowzPDU5", // Replace with your Key ID
    key_secret: "dp793tI70CWW7hRlzNklvbKt", // Replace with your Key Secret
});


// Route to create an order
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const fees = await Rupeemodule.findOne({ username: "admin" });

        const options = {
            amount: fees.rupee * 100, // Amount in smallest currency unit (e.g., paise for INR)
            currency: currency || "INR",
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/verify/and/add/user/data/to/ac", authMiddleware, async (req, res) => {
    try {
        const { user } = req.body;

        if (!user) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const fees = await Rupeemodule.findOne({ username: "admin" }).lean();

        const data = await Balancemodule.findOne({ user: user })
        if (data) {
            sum = parseInt(fees.rupee) + parseInt(data.balance)
            data.balance = sum
            await data.save()
            await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Credited", tp: "Rupee" });
            res.status(200).json({ Status: "OK", message: "Payment verified successfully", rs: fees.rupee });
        } else {
            return res.status(202).json({ Status: "NO" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



// Route to verify payment
app.post("/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user } = req.body;

    try {
        const crypto = require("crypto");
        const hmac = crypto.createHmac("sha256", "dp793tI70CWW7hRlzNklvbKt");

        const fees = await Rupeemodule.findOne({ username: "admin" });

        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature === razorpay_signature) {
            const data = await Balancemodule.findOne({ user: user })
            if (data) {
                sum = parseInt(fees.rupee) + parseInt(data.balance)
                data.balance = sum
                await data.save()
                await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Credited", tp: "Rupee" });
                res.status(200).json({ success: true, message: "Payment verified successfully" });
            } else {
                return res.status(202).json({ Status: "NO" });
            }
        } else {
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }


});



const user_login_admin_Schema = new mongoose.Schema({
    Time: String,
    username: String,
    password: String,
    language: String,
    email: String
}, { timestamps: true });

const Employeloginmodule = mongoose.model('Employes_data', user_login_admin_Schema);


const users_otpSchema = new mongoose.Schema({
    Time: String,
    username: String,
    otp: String
}, { timestamps: true });

const Employeotpmodule = mongoose.model('Employes_otp', users_otpSchema);


app.post("/get/employe/login/data/create/new", async (req, res) => {
    const { username, password, email, language } = req.body;
    try {
        if (!username && !password && !email && !language) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const findDocu = await Employeloginmodule.findOne({ username }).lean();
        if (!findDocu) {
            const hash = await bcrypt.hash(password, 10);
            await Employeloginmodule.create({ Time, username, email, password: hash, language })
            return res.status(200).json({ Status: "OK" })
        } else {
            return res.status(200).json({ Status: "IN" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/all/total/users/data/from/admins/super', adminMiddleware, async (req, res) => {
    try {
        const user = await Employeloginmodule.find({}).lean();
        const data = user.map(dat => ({
            user: dat.username,
            email: dat.email,
            lang: dat.language
        }))
        return res.json({ data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.post('/get/and/login/users/admin/pages/auth', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username && !password) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        const OTP = generateOTP()
        const find_One = await Employeloginmodule.findOne({ username }).lean();
        if (find_One) {
            const isMatch = await bcrypt.compare(password, find_One.password);
            const inorno = await Employeotpmodule.findOne({ username });
            if (isMatch) {
                if (inorno) {
                    await inorno.deleteOne()
                }
                const data = await Employeotpmodule.create({ Time, username, otp: OTP })


                let mailOptions = {
                    from: 'stawropuzzle@gmail.com', // Sender address
                    to: `${find_One.email}`, // List of recipients
                    subject: `stawro, Admin Login OTP`, // Subject line
                    text: '', // Plain text body
                    html: `
                    
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta http-equiv="refresh" content="30" />
                            <title>Document</title>
                            <style>
            
                                @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
            
            
                                .email-main-cnt-01{
                                    width: 95%;
                                    justify-content: center;
                                    margin: auto;
                                }
            
                                .email-cnt-01{
                                    width: 90%;
                                    height: auto;
                                    display: flex;
                                    margin: 10px;
                                }
            
                                .email-cnt-01 div{
                                    width: 50px;
                                    height: 50px;
                                    overflow: hidden;
                                    border-radius: 50%;
                                    border: 1px solid;
                                    
                                }
            
                                .email-cnt-01 div img{
                                    width: 100%;
                                    height: 100%;
                                    object-fit: cover;
                                }
            
                                .email-cnt-01 strong{
                                    font-family: Inknut Antiqua;
                                    margin-left: 10px;
                                }
            
                                .email-cnt-btn-01{
                                    width: 120px;
                                    height: 30px;
                                    margin: 10px;
                                    color: aliceblue;
                                    background-color: rgb(5, 148, 195);
                                    border: 1px solid;
                                    border-radius: 5px;
                                    cursor: pointer;
                                }
            
            
                            </style>
                        </head>
                        <body>
                            <div class="email-main-cnt-01">
                                <div class="email-cnt-01">
                                    <strong>stawro</strong>
                                </div>
                                <div class="email-cnt-02">
                                    <span>Hello, Dear <strong>${data.username}</strong> </span><br/>
                                    <p>Welcome to stawro.<br/>
                                    Login using OTP Authentication, Dont share With anyone, ${data.otp}</p><br/>
                                        
                                    <strong>${data.otp}</strong><br/>
                         
                                    <strong>Thank you</strong>
            
                                </div>
                            </div>
                            
                        </body>
                        </html>
            
                    ` // HTML body
                };

                // Send email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        return res.status(202).json({ message: "Something went Wrong" })
                    }

                    return res.status(200).json({ Status: "OK", data: data._id })
                });

            } else {
                return res.status(200).json({ Status: "BAD" })
            }
        } else {
            return res.status(200).json({ Status: "NO" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.post("/verify/users/language/modele/and/otp", async (req, res) => {
    const { otp, id } = req.body;
    try {
        const find_one = await Employeotpmodule.findById({ _id: id })
        const get_one = await Employeloginmodule.findOne({ username: find_one.username })
        if (parseInt(find_one.otp) === parseInt(otp)) {
            await find_one.deleteOne()
            const token = jwt.sign({ id: get_one._id }, "kanna_stawro_founrs_withhh_1931_liketha", { expiresIn: "2h" });
            return res.status(200).json({ Status: "OK", Token: token, ssid: get_one._id })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

// Start From Here

app.get('/get/user/admin/languages/to/post/:id', users_admin_Middle, async (req, res) => {
    const id = req.params.id;

    try {
        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const get_user = await Employeloginmodule.findById(id).lean();

        if (get_user) {
            const data = {
                lang: get_user.language,
                user: get_user.username
            }
            return res.status(200).json({
                data

            });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



const Questions_usersSchema = new mongoose.Schema({
    Time: String,
    user: String,
    img: String,
    Questio: String,
    qno: String,
    a: String,
    b: String,
    c: String,
    d: String,
    Ans: String,
    lang: String,
    tough: String,
    seconds: String,
}, { timestamps: true });

const Users_Questionsmodule = mongoose.model('Questions_users', Questions_usersSchema);

app.post('/get/a/users/admin/posted/questions/from/all/users', users_admin_Middle, async (req, res) => {
    const { user, img, Questio, a, b, c, d, Ans, tough, seconds } = req.body;

    try {

        if (!user && !img && !Questio && !a && !b && !c && !d && !Ans && !tough && !seconds) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const User_Admin_lang_get = await Employeloginmodule.findById(user).lean()
        const lang = User_Admin_lang_get.language

        const find_usrs = await Users_Questionsmodule.find({ user: User_Admin_lang_get.username }).lean();

        const questionExists = find_usrs.some((item) => item.Questio === Questio);

        if (!questionExists) {
            // Add the question to the database
            const newQuestion = await Users_Questionsmodule.create({
                user: User_Admin_lang_get.username,
                img,
                Questio,
                qno: find_usrs.length + 1, // Increment question number based on existing questions
                a,
                b,
                c,
                d,
                Ans,
                lang,
                tough,
                seconds,
                Time: Time // Automatically set the current time
            });

            return res.status(201).json({
                Status: "OK", qno: newQuestion.qno
            });
        } else {
            // Return a response indicating the question already exists
            return res.status(200).json({ Status: "IN" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/get/admin/sub/users/posted/datas/011/:id', users_admin_Middle, async (req, res) => {
    const id = req.params.id;
    try {

        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const get_user = await Employeloginmodule.findById(id).lean()
        const data = await Users_Questionsmodule.find({ user: get_user.username }).lean()
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.delete('/delete/users/admin/qno/from/admin/users/:id', async (req, res) => {
    const { id } = req.params;

    try {

        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const deletedData = await Users_Questionsmodule.findByIdAndDelete(id);

        if (!deletedData) {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

        return res.status(200).json({ Status: "OK" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/admin/get/tottal/users/created/questions', adminMiddleware, async (req, res) => {
    try {
        const data = await Users_Questionsmodule.find({}).lean()
        if (data) {
            return res.status(200).json({ data })
        } else {
            return res.status(200).json({ Status: 'BAD' })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const Quest_Summery_Schema = new mongoose.Schema({
    Time: String,
    user: String,
    Qno_sel: [],
}, { timestamps: true });

const Quest_summerymodule = mongoose.model('Quest_summery', Quest_Summery_Schema);



app.post('/get/data/and/post/users/selected/data/to/db', async (req, res) => {
    const { user, img, Questio, a, b, c, d, Ans, lang, sel_lang, tough, seconds } = req.body;

    try {

        if (!user && !img && !Questio && !a && !b && !c && !d && !Ans && !lang && !sel_lang && !tough && !seconds) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })


        // Find all questions with the selected language to determine the next question number
        const find_Qst_len = await QuestionModule.find({ lang: sel_lang }).lean();
        const get_lng_dat = await QuestionModule.find({ Questio: Questio }).lean();

        // Create a new question entry with the next question number
        if (get_lng_dat.length <= 0) {
            const post_sel = await QuestionModule.create({
                sub_lang: lang,
                Time: Time, // Add the current timestamp for "Time"
                user,
                img,
                Questio,
                qno: find_Qst_len.length + 1, // Assign the next question number
                a,
                b,
                c,
                d,
                Ans,
                lang: sel_lang,
                tough,
                seconds
            });

            // Check if the user already has a question summary
            const Qust_find = await Quest_summerymodule.findOne({ user });

            if (!Qust_find) {
                // If no summary exists, create a new one
                await Quest_summerymodule.create({
                    Time: Time, // Add the current timestamp
                    user,
                    Qno_sel: [post_sel._id] // Wrap ID in an array
                });
                return res.status(200).json({ Status: "OK" });
            } else {
                // If a summary exists, update it by pushing the new question ID
                await Qust_find.updateOne({
                    $push: { Qno_sel: post_sel._id }
                });
                return res.status(200).json({ Status: "OK" });
            }
        } else {
            return res.status(200).json({ Status: "IN" })
        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get('/get/wallet/amount/credits/links/by/:id', users_admin_Middle, async (req, res) => {
    const id = req.params.id;

    try {

        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        // Find the employee by ID
        const get_name = await Employeloginmodule.findById(id).lean();

        if (!get_name) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Find the question summary for the user
        const find_one = await Quest_summerymodule.findOne({ user: get_name.username }).lean();

        if (!find_one || !find_one.Qno_sel) {
            return res.status(404).json({ message: "No question summary found for this user" });
        }

        // Fetch all questions based on IDs in Qno_sel

        let intd = 0; // Use `let` instead of `const` for mutable variables

        const List = await Promise.all(
            find_one.Qno_sel.map(async (questionId) => {
                const dat = await QuestionModule.findById(questionId);
                return dat?.no?.length - 1 || 0; // Safely handle undefined 'yes'
            })
        );

        let inte = 0;

        const List1 = await Promise.all(
            find_one.Qno_sel.map(async (questionId) => {
                const dat = await QuestionModule.findById(questionId);
                return dat?.yes?.length - 1 || 0; // Safely handle undefined 'yes'
            })
        );

        // Accumulate the total 'yes' lengths
        intd = List.reduce((sum, length) => sum + length, 0);
        inte = List1.reduce((sum, length) => sum + length, 0);

        // Respond with the summary and questions
        const Rupee = (find_one.Qno_sel.length + intd)
        const Datas = {
            Out: intd,
            Ans: inte,
            Rupee: Rupee,
            Total_Quest: find_one.Qno_sel.length
        }
        return res.status(200).json({ Datas });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });

    }
});





// ✅ Notification Schema & Model
const NotificationSchema = new mongoose.Schema(
    {
        tokens: [String], // Array to store FCM tokens
    },
    { timestamps: true }
);
const NotificationModule = mongoose.model("Notification", NotificationSchema);

// // ✅ Send Notification to a Single User
// app.post("/send-notification", async (req, res) => {
//     const { token, title, body } = req.body;

//     if (!token || !title || !body) {
//         return res
//             .status(400)
//             .json({ error: "❌ Missing required fields: token, title, body" });
//     }

//     const message = {
//         token: token,
//         notification: { title, body },
//         data: { type: "chat" },
//         android: {
//             priority: "high",
//             notification: {
//                 sound: "default",
//                 channelId: "high_importance_channel",
//                 priority: "max", // Ensures heads-up notification
//                 visibility: "public", // Ensures it appears over the lock screen
//             },
//         },
//         apns: {
//             payload: {
//                 aps: {
//                     alert: { title, body },
//                     sound: "default",
//                     contentAvailable: true,
//                 },
//             },
//         },
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         console.log("✅ Notification sent:", response);
//         res
//             .status(200)
//             .json({ success: true, message: "Notification sent!", response });
//     } catch (error) {
//         console.error("❌ Error sending notification:", error);
//         res
//             .status(500)
//             .json({ error: "Failed to send notification", details: error.message });
//     }
// });

// ✅ Store FCM Token from App
app.post("/get/new/notification/fcm/token/from/app", async (req, res) => {
    const { fcm } = req.body;

    if (!fcm) {
        return res.status(400).json({ error: "FCM token is required" });
    }

    try {
        let notificationData = await NotificationModule.findOne();
        if (!notificationData) {
            notificationData = new NotificationModule({ tokens: [] });
        }

        if (notificationData.tokens.includes(fcm)) {
            return res
                .status(201)
                .json({ status: "ok", message: "FCM token already exists" });
        }

        notificationData.tokens.push(fcm);
        await notificationData.save();

        res
            .status(200)
            .json({ status: "ok", message: "FCM token stored successfully" });
    } catch (error) {
        console.error("❌ Error handling FCM token:", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
});

// // ✅ Send Notification to All Users
// app.post("/send-notification/to/all", async (req, res) => {
//     const { title, body } = req.body;

//     if (!title || !body) {
//         return res
//             .status(400)
//             .json({ error: "❌ Missing required fields: title, body" });
//     }

//     try {
//         const notificationData = await NotificationModule.findOne();
//         if (!notificationData || !notificationData.tokens || notificationData.tokens.length === 0) {
//             return res.status(400).json({ error: "❌ No FCM tokens found" });
//         }

//         const messages = notificationData.tokens.map((token) => ({
//             token,
//             notification: { title, body },
//             data: { type: "chat" },
//             android: {
//                 priority: "high",
//                 notification: {
//                     sound: "default",
//                     channelId: "high_importance_channel",
//                     priority: "max",
//                     visibility: "public",
//                 },
//             },
//             apns: {
//                 payload: {
//                     aps: {
//                         alert: { title, body },
//                         sound: "default",
//                         contentAvailable: true,
//                     },
//                 },
//             },
//         }));

//         const responses = await Promise.all(messages.map((msg) => admin.messaging().send(msg)));
//         console.log("✅ Notifications sent:", responses.length);

//         res.status(200).json({
//             success: true,
//             message: "Notifications sent!",
//             responses,
//         });
//     } catch (error) {
//         console.error("❌ Error sending notifications:", error);
//         res.status(500).json({
//             error: "Failed to send notifications",
//             details: error.message,
//         });
//     }
// });




// Schema for OTP Verification
const ResetOTPSchema = new mongoose.Schema(
    {
        user: { type: String, required: true }, // User's ID or Email
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Model for OTP
const ResetOTPModel = mongoose.model("Reset_Pass_OTP", ResetOTPSchema);


// Send OTP to user
const sendOTP = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const user = await Usermodule.findById(id).lean();

        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 mins

        const check_old_otp = await ResetOTPModel.findOne({ user: user.email })

        if (check_old_otp) {
            await check_old_otp.deleteOne();
        }

        // Save OTP in database
        await ResetOTPModel.create({ user: user.email, otp, expiresAt });

        // TODO: Send OTP via Email/SMS
        let mailOptions = {
            from: 'stawropuzzle@gmail.com', // Sender address
            to: `${user.email}`, // List of recipients
            subject: `stawro, OTP`, // Subject line
            text: '', // Plain text body
            html: `
        
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="refresh" content="30" />
                <title>Document</title>
                <style>

                    @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');


                    .email-main-cnt-01{
                        width: 95%;
                        justify-content: center;
                        margin: auto;
                    }

                    .email-cnt-01{
                        width: 90%;
                        height: auto;
                        display: flex;
                        margin: 10px;
                    }

                    .email-cnt-01 div{
                        width: 50px;
                        height: 50px;
                        overflow: hidden;
                        border-radius: 50%;
                        border: 1px solid;
                        
                    }

                    .email-cnt-01 div img{
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }

                    .email-cnt-01 strong{
                        font-family: Inknut Antiqua;
                        margin-left: 10px;
                    }

                    .email-cnt-btn-01{
                        width: 120px;
                        height: 30px;
                        margin: 10px;
                        color: aliceblue;
                        background-color: rgb(5, 148, 195);
                        border: 1px solid;
                        border-radius: 5px;
                        cursor: pointer;
                    }


                </style>
            </head>
            <body>
                <div class="email-main-cnt-01">
                    <div class="email-cnt-01">
                        <strong>stawro</strong>
                    </div>
                    <div class="email-cnt-02">
                        <span>Hello, Dear <strong>${user.username}</strong> </span><br/>
                        <p>Welcome to stawro.<br/>
                        OTP to update new Password , Dont share With anyone, ${otp}</p><br/>
                            
                        <strong>${otp}</strong><br/>
             
                        <strong>Thank you</strong>

                    </div>
                </div>
                
            </body>
            </html>

        ` // HTML body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(202).json({ message: "Something went Wrong" })
            }

            return res.status(200).json({ Status: "OK" })
        });

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { id, otp } = req.body;

        if (!id && !otp) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const user = await Usermodule.findById(id).lean()
        const otpRecord = await ResetOTPModel.findOne({ user: user.email, otp });

        if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
        if (new Date() > otpRecord.expiresAt)
            return res.status(400).json({ message: "OTP expired" });

        // OTP verified, delete record
        await ResetOTPModel.deleteOne({ _id: otpRecord._id });

        res.json({ message: "OTP verified, proceed to reset password" });
    } catch (error) {
        res.status(500).json({ error: "OTP verification failed" });
    }
};




// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { id, oldPassword, newPassword } = req.body;

        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ObjectId format" });
        }

        const user = await Usermodule.findById(id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if oldPassword is provided (for normal password change)
        if (oldPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.pass);
            if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.pass = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};



// Reset Password
const resetPasswordWithOTP = async (req, res) => {
    try {
        const { data, otp, newPassword } = req.body;

        if (!data && !otp && !newPassword) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })


        // Find user by username or email
        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify OTP
        const otpRecord = await ResetOTPModel.findOne({ user: user.email, otp });
        if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });
        if (new Date() > otpRecord.expiresAt) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Delete OTP record after successful verification
        await ResetOTPModel.deleteOne({ _id: otpRecord._id });

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.pass = hashedPassword;
        await user.save();

        res.status(200).json({ message: "OTP verified, password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};


const sendForgot_otp = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })

        // Find user by email or username
        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 mins

        // Save OTP in database
        await ResetOTPModel.create({ user: user.email, otp, expiresAt });

        // TODO: Send OTP via Email/SMS
        let mailOptions = {
            from: 'stawropuzzle@gmail.com', // Sender address
            to: `${user.email}`, // List of recipients
            subject: `stawro, OTP`, // Subject line
            text: '', // Plain text body
            html: `
          
          <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <meta http-equiv="refresh" content="30" />
                  <title>Document</title>
                  <style>
  
                      @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
  
  
                      .email-main-cnt-01{
                          width: 95%;
                          justify-content: center;
                          margin: auto;
                      }
  
                      .email-cnt-01{
                          width: 90%;
                          height: auto;
                          display: flex;
                          margin: 10px;
                      }
  
                      .email-cnt-01 div{
                          width: 50px;
                          height: 50px;
                          overflow: hidden;
                          border-radius: 50%;
                          border: 1px solid;
                          
                      }
  
                      .email-cnt-01 div img{
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                      }
  
                      .email-cnt-01 strong{
                          font-family: Inknut Antiqua;
                          margin-left: 10px;
                      }
  
                      .email-cnt-btn-01{
                          width: 120px;
                          height: 30px;
                          margin: 10px;
                          color: aliceblue;
                          background-color: rgb(5, 148, 195);
                          border: 1px solid;
                          border-radius: 5px;
                          cursor: pointer;
                      }
  
  
                  </style>
              </head>
              <body>
                  <div class="email-main-cnt-01">
                      <div class="email-cnt-01">
                          <strong>stawro</strong>
                      </div>
                      <div class="email-cnt-02">
                          <span>Hello, Dear <strong>${user.username}</strong> </span><br/>
                          <p>Welcome to stawro.<br/>
                          OTP to update new Password , Dont share With anyone, ${otp}</p><br/>
                              
                          <strong>${otp}</strong><br/>
               
                          <strong>Thank you</strong>
  
                      </div>
                  </div>
                  
              </body>
              </html>
  
          ` // HTML body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(202).json({ message: "Something went Wrong" })
            }

            return res.status(200).json({ Status: "OK", data: data._id })
        });

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
}

app.post("/sendOTP/by/api/using/funtcion", sendOTP);
app.post("/verifyOTP", verifyOTP);
app.post("/resetPassword", resetPassword);

app.post("/sent/forgot/pass/app", sendForgot_otp);
app.post("/resetPasswordWithOTP", resetPasswordWithOTP);





app.delete("/delete/account/data/by/id/from/app/:id", async (req, res) => {
    const { id } = req.params;

    try {

        console.log("Deleting")
        if (!id) return res.status(400).json({ Status: "BAD", message: "Some Data Missing" })
        console.log("Deleting")
        const deletedUser = await UPImodule.findOneAndDelete({ user: id });

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }


        return res.status(200).json({ status: "OK", message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});



const PORT = 80;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const start_Stop_Schema = new mongoose.Schema({
    Time: String,
    Status: String,
    text: String,
    user: { type: String, unique: true }, // Unique constraint
}, { timestamps: true });

const Start_StopModule = mongoose.model('Start_Stop', start_Stop_Schema);


app.get("/start/or/no/check", async (req, res) => {
    try {

        const data = await Start_StopModule.findOne({ user: "kick" })
        if (data) {
            return res.status(200).json({ status: data })
        } else {
            return res.status(200).json({ Status: "BAD" })
        }


    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
})



app.post("/start/game/by/click", async (req, res) => {
    const { status, text } = req.body;

    try {
        // Check if required data is present
        if (!status) {
            return res.status(400).json({ Status: "MISSING_STATUS", message: "Status is required" });
        }

        // Check if a game status document exists
        const data = await Start_StopModule.findOne({ user: "kick" });

        if (data) {
            // Update existing status
            data.Status = status;
            data.text = text;
            data.Time = new Date(); // Optional: Update timestamp
            await data.save();
            return res.status(200).json({ Status: "OK", message: "Game status updated successfully" });
        } else {
            // Create a new document
            const Time = new Date();
            await Start_StopModule.create({ Time, Status: status, user: "kick", text });
            return res.status(200).json({ Status: "OK", message: "Game status updated successfully" });
        }



    } catch (error) {
        console.error("Error updating game status:", error);
        return res.status(500).json({ Status: "SERVER_ERR", message: "Failed to update game status" });
    }
});



// app.get('/try/new/:id', async (req, res) => {
//     const {id} = req.params;
//     const data = await Usermodule.findById(id);
//     return res.status(200).json(data);

// });







const user_track_ip = new mongoose.Schema({
    Time: String,
    ip: String,
    city: String
}, { timestamps: true });

const userstrackmodule = mongoose.model('Users_IP_Track', user_track_ip);

app.post('/new/ip/data', async (req, res) =>{
    
    const {ip, city} = req.body;

    try{
        const user = await userstrackmodule.findOne({ip :ip})
        if(!user){
            await userstrackmodule.create({Time, ip, city})
            return res.status(200).json({Status : "OK"})
        }
        return res.status(200).json({Status : "In"})
    }catch (error) {
        console.error("Error updating game status:", error);
        return res.status(500).json({ Status: "SERVER_ERR", message: "Failed to update game status" });
    }
})






const comment_Schema = new mongoose.Schema({
    Time: String,
    text : String,
    stars : String,
    name : String,
    profile : String,
    email :  String,
    like : [],
    user: { type: String, unique: true }, // Unique constraint
}, { timestamps: true });

const CommentModule = mongoose.model('comment', comment_Schema);


app.post("/get/new/post/from/comment", authMiddleware, async (req, res) => {
    const { text, stars, name, profile, email } = req.body;
    const Time = new Date(); // Add Time assignment

    try {
        if (!text || !stars || !name || !profile || !email) {
            return res.status(400).json({ Status: "Miss", message: "Required fields are missing" });
        }

        const existingComment = await CommentModule.findOne({ email });

        if (!existingComment) {
            const user_data = await Usermodule.findOne({ email });
            const fees = await Rupeemodule.findOne({ username: "admin" });

            if (!user_data || !fees) {
                return res.status(404).json({ Status: "Not Found", message: "User or Fee data not found" });
            }

            const bal_data = await Balancemodule.findOne({ user: user_data._id });

            const crt = await CommentModule.create({
                Time,
                text,
                stars,
                name,
                user: user_data._id,
                profile,
                email
            });

            if (!bal_data) {
                const bal = parseInt(fees.rupee) + 5;
                await Balancemodule.create({
                    user: user_data._id,
                    Time,
                    balance: bal.toString()
                });

                await Historymodule.create({
                    Time,
                    user: user_data._id,
                    rupee: bal.toString(),
                    type: "Credited",
                    tp: "Rupee"
                });

                return res.status(200).json({ Status: "OK", to : crt._id , message: "Created New with Bonus" });
            } else {
                const new_bal = parseInt(bal_data.balance) + parseInt(fees.rupee);
                bal_data.balance = new_bal;
                await bal_data.save();

                await Historymodule.create({
                    Time,
                    user: user_data._id,
                    rupee: fees.rupee,
                    type: "Credited",
                    tp: "Rupee"
                });

                return res.status(200).json({ Status: "OK", to : crt._id ,message: "Created New" });
            }
        } else {
            return res.status(200).json({ Status: "IN", message: "Already Exists" });
        }
    } catch (error) {
        console.error("Error in creating comment:", error);
        return res.status(500).json({
            Status: "SERVER_ERR",
            message: "Failed to create comment"
        });
    }
});

// app.post("/make/like/review/count", authMiddleware, async (req, res) => {
//   const { l_id, email } = req.body;
//   const Time = new Date();

//   try {
//     if (!l_id || !email) {
//       return res.status(400).json({ Status: "Miss" });
//     }


//     const data = await CommentModule.findById({ _id: l_id });

//     if(data.email === email){
//         return res.status(200).json({Status : "U"})
//     }


//     if (!data) {
//       return res.status(404).json({ Status: "Not Found", message: "Comment not found" });
//     }

//     const updated = await CommentModule.findOneAndUpdate(
//       { _id: l_id, like: { $ne: email } },
//       { $addToSet: { like: email } }
//     );

//     if (!updated) {
//       return res.status(200).json({ Status: "Exist" });
//     }

//     const user_data = await Usermodule.findOne({ email });
//     if (!user_data) {
//       return res.status(404).json({ Status: "Not Found", message: "User not found" });
//     }

//     const fees = await Rupeemodule.findOne({ username: "admin" });
//     if (!fees) {
//       return res.status(500).json({ Status: "Server Error", message: "Fee config missing" });
//     }

//     let bal_data = await Balancemodule.findOne({ user: user_data._id });
//     if (!bal_data) {
//       await Balancemodule.create({
//         user: user_data._id,
//         Time,
//         balance: "5"
//       });

//       await Historymodule.create({
//         Time,
//         user: user_data._id,
//         rupee: "5",
//         type: "Credited",
//         tp: "Rupee"
//       });

//       bal_data = await Balancemodule.findOne({ user: user_data._id });
//     }

//     const added_bal = parseInt(bal_data.balance) + parseInt(fees.rupee);
//     bal_data.balance = added_bal.toString();
//     await bal_data.save();

//     await Historymodule.create({
//       Time,
//       user: user_data._id,
//       rupee: fees.rupee,
//       type: "Credited",
//       tp: "Rupee"
//     });

//     return res.status(200).json({ Status: "OK", message: "Like recorded and balance updated" });
//   } catch (error) {
//     console.error("Error updating like and balance:", error);
//     return res.status(500).json({ Status: "SERVER_ERR", message: "Failed to process like" });
//   }
// });


app.post("/make/like/review/count", authMiddleware, async (req, res) => {
  const { l_id, email } = req.body;
  const Time = new Date();

  try {
    if (!l_id || !email) {
      return res.status(400).json({ Status: "Miss" });
    }

    // Check if the user already liked ANY document
    const alreadyLiked = await CommentModule.findOne({ like: email });
    if (alreadyLiked) {
      return res.status(200).json({
        Status: "ALREADY_LIKED",
        message: "You can like only one document.",
      });
    }

    // Find the comment/document by ID
    const data = await CommentModule.findById({ _id: l_id });
    if (!data) {
      return res.status(404).json({ Status: "Not Found", message: "Comment not found" });
    }

    if (data.email === email) {
      return res.status(200).json({ Status: "U" }); // User trying to like their own doc?
    }

    // Add like only if not already present (redundant here, but safe)
    const updated = await CommentModule.findOneAndUpdate(
      { _id: l_id, like: { $ne: email } },
      { $addToSet: { like: email } }
    );

    if (!updated) {
      return res.status(200).json({ Status: "Exist" });
    }

    // Proceed with user and balance updates
    const user_data = await Usermodule.findOne({ email });
    if (!user_data) {
      return res.status(404).json({ Status: "Not Found", message: "User not found" });
    }

    const fees = await Rupeemodule.findOne({ username: "admin" });
    if (!fees) {
      return res.status(500).json({ Status: "Server Error", message: "Fee config missing" });
    }

    let bal_data = await Balancemodule.findOne({ user: user_data._id });
    if (!bal_data) {
      await Balancemodule.create({
        user: user_data._id,
        Time,
        balance: "5",
      });

      await Historymodule.create({
        Time,
        user: user_data._id,
        rupee: "5",
        type: "Credited",
        tp: "Rupee",
      });

      bal_data = await Balancemodule.findOne({ user: user_data._id });
    }

    const added_bal = parseInt(bal_data.balance) + parseInt(fees.rupee);
    bal_data.balance = added_bal.toString();
    await bal_data.save();

    await Historymodule.create({
      Time,
      user: user_data._id,
      rupee: fees.rupee,
      type: "Credited",
      tp: "Rupee",
    });

    return res.status(200).json({
      Status: "OK",
      message: "Like recorded and balance updated",
    });

  } catch (error) {
    console.error("Error updating like and balance:", error);
    return res.status(500).json({
      Status: "SERVER_ERR",
      message: "Failed to process like",
    });
  }
});



app.get("/comment/review/frome/all/users", async(req, res)=>{
    try{
        const data = await CommentModule.find({}).lean()
        return res.status(200).json({data})
    }catch (error) {
        console.error("Error updating like and balance:", error);
        return res.status(500).json({ Status: "SERVER_ERR", message: "Failed to process like" });
    }
})

app.get("/comment/get/single/data/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const data = await CommentModule.findById(id); // Corrected: removed `{}`

    if (data) {
      return res.status(200).json({ data });
    } else {
      return res.status(404).json({ Status: "NO_DATA", message: "No data found" });
    }
  } catch (error) {
    console.error("Error fetching comment data:", error);
    return res.status(500).json({ Status: "SERVER_ERR", message: "Failed to fetch data" });
  }
});



app.get("/comment/get/single/data/email/:email", authMiddleware , async (req, res) => {
  const email = req.params.email;

  try {
    // Fetch the first comment that matches the email
    const data = await CommentModule.findOne({ email : email });

    if (data) {
      return res.status(200).json({ data });
    } else {
      return res.status(404).json({ Status: "NO_DATA", message: "No data found for this email." });
    }
  } catch (error) {
    console.error("Error fetching comment data:", error);
    return res.status(500).json({ Status: "SERVER_ERR", message: "Failed to fetch comment data." });
  }
});





process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

