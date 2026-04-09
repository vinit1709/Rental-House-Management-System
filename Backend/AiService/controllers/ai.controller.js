import { GoogleGenerativeAI } from '@google/generative-ai';
import { validationResult } from "express-validator";
import Tesseract from 'tesseract.js';

import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const suggestRentPrice = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        // 1. Extract the data sent from the Landlord frontend
        const { propertyType, bhk, location, furnishing, size } = req.body;

        if (!propertyType || !location) {
            return res.status(400).json({ message: "Property type and location are required." });
        }

        // 2. Select the Gemini model (CHANGED THIS LINE TO FIX THE 404 ERROR)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 3. Prompt Engineering: Tell Gemini exactly what we want and HOW to format it
        const prompt = `
            You are an expert real estate appraiser in India. Estimate the monthly rent for this property:
            - Property Type: ${propertyType}
            - Configuration: ${bhk || 'Not specified'}
            - Location/Pincode: ${location}
            - Furnishing Status: ${furnishing || 'Unfurnished'}
            - Size: ${size || 'Not specified'} sq.ft.

            Based on current market trends, provide a rent range and a specific recommended price in INR.
            
            IMPORTANT: You must respond ONLY with a valid, parsable JSON object. Do not include any markdown formatting like \`\`\`json. 
            Use exactly this structure:
            {
                "minRent": 15000,
                "maxRent": 20000,
                "recommendedRent": 18000,
                "explanation": "A short 2-sentence explanation of why this price makes sense based on the location and amenities."
            }
        `;

        // 4. Call the AI
        const result = await model.generateContent(prompt);
        // console.log(result.response.text());

        let responseText = result.response.text();

        // 5. Clean up the response (just in case the AI stubbornly includes markdown backticks)
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the string into a real JavaScript object
        const aiSuggestion = JSON.parse(responseText);

        // 6. Send the structured data back to the frontend!
        return res.status(200).json({
            success: true,
            data: aiSuggestion
        });

    } catch (error) {
        console.error("AI Rent Suggestion Error:", error);
        res.status(500).json({ message: "Failed to generate rent suggestion from AI." });
    }
};

export const scanDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No document image provided for scanning." });
        }

        // 1. Grab the expected name sent from the Admin frontend
        const expectedName = req.body.expectedName ? req.body.expectedName.toUpperCase() : "";

        // 2. Run Tesseract OCR
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
        const cleanText = text.toUpperCase(); // Normalize for easier comparison

        // 3. Extract ID Numbers
        const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
        const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;

        let documentType = "Unknown / Unrecognized";
        let extractedIdNumber = null;

        if (panRegex.test(cleanText)) {
            documentType = "PAN Card";
            extractedIdNumber = cleanText.match(panRegex)[0];
        } else if (aadhaarRegex.test(cleanText)) {
            documentType = "Aadhaar Card";
            extractedIdNumber = cleanText.match(aadhaarRegex)[0].replace(/\s/g, '');
        }

        // 4. NEW: Name Matching Logic
        let nameMatchStatus = "Not Found";
        let nameMatchConfidence = 0;

        if (expectedName) {
            // Split the name into parts (e.g. "John", "Doe")
            const nameParts = expectedName.split(' ').filter(part => part.length > 2);
            let matchedParts = 0;

            nameParts.forEach(part => {
                // If the OCR text contains the name part, increase the score
                if (cleanText.includes(part)) {
                    matchedParts++;
                }
            });

            if (nameParts.length > 0) {
                nameMatchConfidence = Math.round((matchedParts / nameParts.length) * 100);
            }

            // Assign a status based on how much of the name was found
            if (nameMatchConfidence === 100) nameMatchStatus = "Exact Match";
            else if (nameMatchConfidence >= 50) nameMatchStatus = "Partial Match";
            else nameMatchStatus = "Mismatch";
        }

        // 5. Determine Overall KYC Status
        let overallStatus = "FAILED";
        if (extractedIdNumber && nameMatchConfidence >= 50) {
            overallStatus = "VERIFIED";
        } else if (extractedIdNumber) {
            overallStatus = "ID_FOUND_NAME_MISMATCH";
        }

        return res.status(200).json({
            success: true,
            data: {
                documentType,
                extractedIdNumber,
                expectedName,
                nameMatchStatus,
                nameMatchConfidence,
                overallStatus,
                rawExtractedText: text
            }
        });

    } catch (error) {
        console.error("OCR Scanner Error:", error);
        res.status(500).json({ message: "Failed to scan the document image." });
    }
};