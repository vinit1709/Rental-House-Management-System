import dotenv from 'dotenv';
dotenv.config();

async function checkMyModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERROR: No API Key found in .env file!");
        return;
    }

    console.log(`🔍 Checking Google API with key ending in: ...${apiKey.slice(-4)}`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("\n❌ GOOGLE API ERROR:");
            console.error(data.error.message);
            console.log("\nFix: You might need to generate a new key directly from https://aistudio.google.com/app/apikey");
            return;
        }

        if (data.models) {
            console.log("\n✅ SUCCESS! Your API Key has access to the following models that support generateContent:\n");

            // Filter only models that support the generateContent method
            const supportedModels = data.models.filter(m =>
                m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
            );

            supportedModels.forEach(m => {
                // The API returns names like "models/gemini-1.5-flash", we just want the part after the slash
                const cleanName = m.name.replace('models/', '');
                console.log(`- ${cleanName}`);
            });

            console.log("\n👉 ACTION: Pick ONE of the exact names above and put it in your ai.controller.js file!");
        }
    } catch (err) {
        console.error("Failed to fetch:", err);
    }
}

checkMyModels();