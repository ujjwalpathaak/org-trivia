dotenv.config();
import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

const generateRPnAQuetsions = async () => {
    const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
    };

    const prompt = `Generate a list of 52 challenging puzzle questions covering different aspects. The difficulty level should be suitable for adults—not too easy. The questions should span the following categories:
        1. Logical Puzzles: Brain teasers, pattern recognition, and lateral thinking problems.
        2. Mathematical Puzzles: Number sequences, algebraic tricks, probability-based problems, etc.
        3. English Word Play: Word twisters, anagrams, tricky sentence-based questions, and riddles.
        4. API-related Questions: Conceptual and technical questions about APIs, including REST, GraphQL, rate limiting, authentication (OAuth, JWT), API design best practices, and integration challenges.

        The output should be provided in the following JSON format:

        Output Format (JSON Array):  
        [ 
            {
                question: <question goes here>,
                answer: <index of answer goes here>,
                options: [
                    <option 1>,
                    <option 2>,
                    <option 3>,
                    <option 4>
                ]
            },
            // repeat this format for each question.
        ]

        Ensure the questions are diverse and thought-provoking.
    `

    console.log("Sending request to Gemini...");
    const result = await model.generateContent(prompt, generationConfig);
    let responseText = result.response.text();
    if (responseText.startsWith("```json") && responseText.endsWith("```")) {
        responseText = responseText.slice(7, -3).trim();
    }

    console.log("Final Array:", JSON.parse(responseText))
};

generateRPnAQuetsions();