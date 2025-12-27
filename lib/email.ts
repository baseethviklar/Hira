
import nodemailer from "nodemailer";

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            text,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
