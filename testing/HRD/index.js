dotenv.config();
import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

const generateMCQQuizFromPDF = async (pdfText) => {
    const chunkSize = 2000;
    const textChunks = [];

    for (let i = 0; i < pdfText.length; i += chunkSize) {
        textChunks.push(pdfText.slice(i, i + chunkSize));
    }

    const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
    };

    let allQuestions = [];

    for (let chunk of textChunks) {
        const prompt = `Generate a multiple-choice quiz based on the HR document text provided.
            - Carefully analyze the text to create questions that test understanding of key topics.
            - Each question should have four answer choices, with one correct answer indicated.
            - Avoid overly simple choices—make the options require thoughtful consideration.

            HR Doc Chunk:
            ${chunk}

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
        `

        console.log("Sending request to Gemini for a chunk...");
        const result = await model.generateContent(prompt, generationConfig);
        let responseText = result.response.text();
        if (responseText.startsWith("```json") && responseText.endsWith("```")) {
            responseText = responseText.slice(7, -3).trim();
          }
                  allQuestions.push(...JSON.parse(responseText))

    }

    console.log("Final Array:", allQuestions)
};

generateMCQQuizFromPDF(`
    // text goes here
`);