import ejs from "ejs";
import path from "path";
import transporter from "../mailConfig.js"; // Ensure this path is correct
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendEmail = async ({to, subject, templateName, data}) => {
  try {
    const templatePath = path.join(
      __dirname, '..',
      "templates",
      `${templateName}.ejs`
    );

    // Log to debug if needed
    // console.log("Using template:", templatePath);
    // console.log("Data passed:", data);

    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: process.env.HOST_EMAIL,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
