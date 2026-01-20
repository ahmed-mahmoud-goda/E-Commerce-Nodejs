const nodemailer = require("nodemailer")

const sendMail = async (options)=>{
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const emailOptions = {
        from: "E-commerce <support@Ecommerce.nodejs>",
        to: options.to,
        subject: options.subject,
        html: options.html
    }

    await transporter.sendMail(emailOptions)
}

module.exports = sendMail;