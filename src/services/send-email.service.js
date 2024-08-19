import nodemailer from "nodemailer";

export const sendEmailService = async ({
    to,
    subject,
    text,
    html
}) => {


    //transporter configration
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: 587,
        service: "gmail",
        secure: false,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
        tls: {
            rejectUnauthorized: true
        }
    }); 

    //message configration
    const info = await transporter.sendMail({
        from: "No-reply <mahmoudelziny20@gmail.com>",
        to: to,
        subject: subject,
        html: html ? html : "",
        text: text ? text : ""
    });
    
    
    return info;


};
