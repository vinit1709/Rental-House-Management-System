import { validationResult } from 'express-validator';
import { sendEmail } from '../services/email.service.js';

export const sendEmailController = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { to, subject, templateName, data } = req.body;

        await sendEmail({ to, subject, templateName, data });
        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error in sendEmailController:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}