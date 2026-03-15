const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./app.js');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log("Uncaught Exception occured, Shutting down...");
    process.exit(1);
})


const connStr = process.env.LOCALCONNSTR;

mongoose.connect(connStr)
    .then((conn) => {
        console.log("DB connected successfully");
    })
    .catch((err) => {
        console.log("DB connection failed");
        process.exit(1);
    });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('server has started...');
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log("Unhandled Rejection occured, Shutting down...");
    server.close(() => {
        process.exit(1);
    })
})