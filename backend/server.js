// const express = require('express');
// const app = express();
// require('dotenv').config();
// const cors=require('cors')
// const oauth2Client=require('../utils/oauth2client')
// const User = require('../models/userModel');

// const port = process.env.PORT || 5000;

// const corsOptions = {
//     origin: 'http://localhost:5173', // Allow only this origin
//     methods: ['GET', 'POST'], // Allow specific HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
//     credentials: true, // Allow cookies and other credentials
// };
// app.use(cors(corsOptions));


// async function googleAuth(){
//     const googleRes = await oauth2Client.oauth2Client.getToken(code);
    
//     oauth2Client.oauth2Client.setCredentials(googleRes.tokens);

//     const userRes = await axios.get(
//         `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
// 	);
	
//     let user = await User.findOne({ email: userRes.data.email });
   
//     if (!user) {
//         console.log('New User found');
//         user = await User.create({
//             name: userRes.data.name,
//             email: userRes.data.email,
//             image: userRes.data.picture,
//         });
//     }

//     createSendToken(user, 201, res);
// }




// // Route for Google OAuth callback
// app.get('/api/v1/auth/google/callback/', (req, res) => {
//     const code = req.query.code; // Access the query parameter "code"
//     console.log(code, "===========================");

//     if (code) {
//         res.send("Authorization code received!");
//     } else {
//         res.status(400).send("Authorization code is missing!");
//     }
// googleAuth()
    
// });

// app.listen(port, () => {
//     console.log(`Server listening on http://localhost:${port}`);
// });




const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
// const path = require('path');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const router = require('./routes/routes');
const authRouter = require('./routes/authRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const app = express();

dotenv.config(); // <- connecting the enviroment variables
// MIDLEWARES ->>
app.set('trust proxy', 1);

const port = process.env.PORT || 5000;

//db config
const DB = process.env.DATABASE

mongoose
	.connect(DB, {
		
	})
	.then(() => {
		console.log('DB connection established');
	})
	.catch((err) => {
		console.log('DB CONNECTION FAILED');
		console.log('ERR: ', err);
	});



const corsOptions = {
    origin: 'http://localhost:5173', // Allow only this origin
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true, // Allow cookies and other credentials
};
app.use(cors(corsOptions));



console.log((`ENV = ${process.env.NODE_ENV}`));
app.use(morgan('dev')); // <- Logs res status code and time taken

const limiter = rateLimit({	// <- Limits the number of api calls that can be made per IP address
	max: 1000, // max number of times per windowMS
	windowMs: 60 * 60 * 1000,
	message:
        '!!! Too many requests from this IP, Please try again in 1 hour !!!',
});

app.use('/api/v1', limiter);

app.use((req, res, next) => {	// <- Serves req time and cookies
	
	req.requestTime = new Date().toISOString();
	console.log(req.requestTime);
	if (req.cookies) console.log(req.cookies);
	next();
});

app.use((req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	next();
});

app.use(express.json({ limit: '100mb' })); // <- Parses Json data
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // <- Parses URLencoded data

app.use(mongoSanitize()); // <- Data Sanitization aganist NoSQL query Injection.
app.use(xss()); // <- Data Sanitization against xss

app.use(compression());

app.use('/api/v1/auth/', authRouter);
app.use('/api/', router); // <- Calling the router

app.all('*', (req, res, next) => {	// <- Middleware to handle Non-existing Routes
	next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(errorController); // <- Error Handling Middleware


process.on('unCaughtException', (err) => {
	console.log(`UNCAUGHT EXCEPTION -> ${err.name} - ${err.message}`);
	console.log('App SHUTTING DOWN...');
	process.exit(1); // <- Then will shut down the server.
});


process.on('unhandledRejection', (err) => {
	console.log(`UNHANDELLED REJECTION -> ${err.name} - ${err.message}`);
	console.log(err);
	console.log('App SHUTTING DOWN...');
	server.close(() => {	// <- This will first terminate all requests
		
		process.exit(1); // <- Then will shut down the server.
	});});

app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });

