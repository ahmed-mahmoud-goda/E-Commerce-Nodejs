const jwt = require('jsonwebtoken')
const asyncErrorHandler = require('./../utils/asyncErrorHandler.js')
const customError = require('./../utils/customError.js')
const User = require("./../models/userModel.js")
const sendEmail = require("./../utils/email.js")
const crypto = require("crypto")

const getToken = (id) => {
    return jwt.sign({ id: id }, process.env.SECRET_STR, { expiresIn: process.env.LOGIN_EXPIRE })
}

const createResponse = (user, statusCode, res) => {
    user.password = undefined;
    const token = getToken(user._id);

    const options = {
        maxAge: parseInt(process.env.LOGIN_EXPIRE),
        httpOnly: true
    }
    if (process.env.NODE_ENV == 'production') {
        options.secure = true;
    }

    res.cookie('jwt', token, options);

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}

const protect = asyncErrorHandler(async (req, res, next) => {
    const Testtoken = req.headers.authorization;
    let token;
    if (Testtoken && Testtoken.startsWith('Bearer')) {
        token = Testtoken.split(' ')[1];
    }
    if (!token) {
        const error = new customError('You are not logged in', 401);
        next(error);
    }

    const decoded = jwt.verify(token, process.env.SECRET_STR);

    const user = await User.findById(decoded.id);
    if (!user) {
        const error = new customError('User not found', 401);
        next(error);
    }

    const isChanged = await user.isPasswordChanged(decoded.iat);
    if (isChanged) {
        const error = new customError('Please log in again', 401);
        next(error);
    }
    req.user = user;
    next();
})

const restrict = (...role)=>{
    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            const error = new customError('You are not allowed to do this', 403);
            next(error);
        }
        next();
    }
}

const signup = asyncErrorHandler(async (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword) {
        const error = new customError("Password and Confirm Password do not match");
        return next(error);
    }
    const user = await User.create(req.body);

    const token = user.createToken("verification");
    await user.save({ validateBeforeSave: false });

    const url = `${req.protocol}://${req.get("host")}/api/v1/auth/verify/${token}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `<p>Click to verify:</p><a href="${url}">${url}</a>`
    });

    res.status(201).json({
        status: "success",
        message: "Account created, Please verify your email"
    })
})

const login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const error = new customError("Please enter your email and password", 400);
        return next(error);
    }
    const user = await User.findOne({ email: email }).select('+password')

    if (!user || !(await user.comparePassword(password, user.password))) {
        const error = new customError("Incorrect email or password", 400);
        return next(error);
    }
    if (!user.isVerified) {
        const error = new customError("Please verify your email first", 401);
        return next(error);
    }
    createResponse(user, 200, res);
})

const verifyEmail = asyncErrorHandler(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });

    if (!user) {
        const error = new customError("Token is invalid or expired", 400);
        return next(error);
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Email verified, Please log in"
    })
})

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        const error = new customError("User not found", 404);
        return next(error);
    }
    const token = user.createToken("reset");
    await user.save({ validateBeforeSave: false });

    const url = `${req.protocol}://${req.get("host")}/api/v1/auth/reset/${token}`;

    await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click to reset:</p><a href="${url}">${url}</a>`
    });

    res.status(200).json({
        status: "success",
        message: "Email sent successfully"
    })
})

const resetPassword = asyncErrorHandler(async (req, res, next) => {
    if (req.body.password !== req.body.confirmPassword) {
        const error = new customError("Password and Confirm Password do not match",400);
        return next(error);
    }
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
        const error = new customError("Token is invalid or expired", 400);
        return next(error);
    }
    user.password = req.body.password;
    user.passwordChangedAt = Date.now();
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();
    res.status(200).json({
        status: "success",
        message: "Password changed successfully"
    });
})

const updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');
    if(!(await user.comparePassword(req.body.currentPassword,user.password))){
        return next(new customError('The password you provided is wrong'),401)
    }
    if(req.body.password != req.body.confirmPassword){
        return next(new customError("Password and Confirm Password do not match",400));
    }
    user.password = req.body.password;
    user.passwordChangedAt = Date.now();

    await user.save();
    createResponse(user,200,res);
})

module.exports = { protect,restrict, signup, login, verifyEmail, forgotPassword, resetPassword, updatePassword };