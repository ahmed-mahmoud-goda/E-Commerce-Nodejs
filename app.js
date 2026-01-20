const express = require('express');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const sanitize = require('./utils/sanitize.js');
const globalErrorHandler = require('./controllers/errorController.js');
const CustomError = require('./utils/customError.js');
const authRoutes = require('./routes/authRoutes.js')

const app = express();

// Data Sanitization

const limiter = rateLimiter({
    windowMs: 60*60*1000,
    limit: 1000,
    message:"Too many requests from this IP"
})

app.use(limiter);
app.use(helmet());
app.use(express.json({limit:'10kb'}));
app.use(xss());
app.use(hpp());
app.use(cookieParser())
app.use((req,res,next)=>{
    if(req.body) req.body = sanitize(req.body);
    if(req.params) req.params = sanitize(req.params);
    next();
})
app.use(globalErrorHandler);

// App Routes

app.use('/api/v1/auth',authRoutes)

app.use((req,res,next)=>{
    const err = new CustomError(`URL: ${req.originalUrl} is not found`,404);
    next(err);
})


module.exports = app;