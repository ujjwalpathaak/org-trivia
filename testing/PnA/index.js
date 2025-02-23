import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { generatePnAPrompt } from "../prompts.js";

import { GoogleGenerativeAI } from "@google/generative-ai";
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-01-21",
  });

const companyName = "Darwinbox";
const PnAQuestions = [
  {
    "question": "Golu starts from his house and walks 8 km north. Then, he turns left and walks 6 km. What is the shortest distance from his house?",
    "img": null,
    "options": ["10 km", "16 km", "14 km", "2 km"],
    "answer": 0,
    "refactor": false
  },
  {
    "question": "P starts walking 25 m west from his house, then turns right and walks 10 m. He turns right again and walks 15 m. After this, he turns right at an angle of 135° and walks 30 m. In which direction is he now heading?",
    "img": null,
    "options": ["West", "South", "South-West", "South-East"],
    "answer": 2,
    "refactor": true
  },
  {
    "question": "X starts walking straight south for 5 m, then turns left and walks 3 m. After that, he turns right and walks another 5 m. In which direction is X facing now?",
    "img": null,
    "options": ["North-East", "South", "North", "South-West"],
    "answer": 1,
    "refactor": true
  },
  {
    "question": "Hemant leaves his house, which is in the east, and reaches a crossing. The road to his left leads to a theatre, while the road straight ahead leads to a hospital. In which direction is the university?",
    "img": null,
    "options": ["North", "South", "East", "West"],
    "answer": 0,
    "refactor": false
  }
];

const generateRPnAQuetsions = async (companyName, PnAQuestions) => {
    const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
    };

    for(let question = 0; question < PnAQuestions.length; question++){
      if(PnAQuestions[question].refactor){
        const result = await model.generateContent(generatePnAPrompt(companyName, PnAQuestions[question].question), generationConfig);
        let responseText = result.response.text();
        
        PnAQuestions[question].question = responseText;
      }
    }

    // if (responseText.startsWith("```json") && responseText.endsWith("```")) {
    //     responseText = responseText.slice(7, -3).trim();
    // }

    console.log(PnAQuestions)
};

generateRPnAQuetsions(companyName, PnAQuestions);