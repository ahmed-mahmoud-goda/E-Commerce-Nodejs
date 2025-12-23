const CustomError = require("../utils/customError");

const castErrorHandler = (error) => {
    const message = `Invalid value for ${error.path}: ${error.value}`
    return new CustomError(message, 400)
}
const duplicateKeyErrorHandler = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`
    return new CustomError(message, 400)
}
const validationErrorHandler = (error) => {
    const errorMessage = Object.values(error.errors).map(val => val.message);
    const message = `Invalid Data: ${errorMessage.join('. ')}`;
    return new CustomError(message, 400);
}
const tokenExpiredHandler = (error) => {
    const message = 'Token Expired, Please login again';
    return new CustomError(message, 401);
}
const jwtErrorHandler = (error) => {
    const message = 'Invalid Token, Please login again';
    return new CustomError(message, 401);
}


const devError = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        statusCode: error.statusCode,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}

const prodError = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status:error.status,
            statusCode:error.statusCode,
            message: error.message
        })
    }
    else{
        res.status(500).json({
            status:"error",
            message:"Something went wrong"
        })
    }
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        devError(res, error);
    }
    else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'CastError') error = castErrorHandler(error);
        if (error.code === 11000) error = duplicateKeyErrorHandler(error);
        if (error.name === 'ValidationError') error = validationErrorHandler(error);
        if (error.name === 'TokenExpiredError') error = tokenExpiredHandler(error);
        if (error.name === 'JsonWebTokenError') error = jwtErrorHandler(error);

        prodError(res, error);
    }
}