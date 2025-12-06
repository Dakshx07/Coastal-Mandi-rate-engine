import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.log("No API Key found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // There isn't a direct "listModels" on the instance in the new SDK easily accessible without setup, 
    // but we can try a simple generation to see if it works, or catch the error.
    // Actually, the error message itself suggests calling ListModels. 
    // Let's try to just run a simple generation with 'gemini-1.5-flash' and see if it works in this script.
    
    console.log("Testing gemini-1.5-flash...");
    const result = await model.generateContent("Hello");
    console.log("Success! Response:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

list();
