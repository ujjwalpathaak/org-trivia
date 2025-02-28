import dotenv from 'dotenv';
dotenv.config();

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

const readTextFromHRDoc = async (filePath) => {
  try {
    const data = await fs.readFile(filePath);
    const pdfData = await pdf(data);
    return pdfData.text;
  } catch (err) {
    console.error(`Error reading/parsing ${filePath}:`, err);
    return null;
  }
};

const generateMCQQuizFromPDF = async (pdfText) => {
  if (!pdfText) {
    console.error("No text extracted from PDF.");
    return;
  }

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
    responseMimeType: 'application/json',
  };

  let allQuestions = [];

  for (let chunk of textChunks) {
    const prompt = `Generate a multiple-choice quiz based on the HR document text provided.
            - Each question should have four answer choices, with one correct answer indicated.
            - Avoid overly simple choices—make the options require thoughtful consideration.
            - Each questions should have the context of the document that is being reffered to
              user wont have access to the document at the time of the quiz.

            HR Doc Chunk:
            ${chunk}

            Output Format (JSON Array):  
            [ 
                {
                    "question": "Question goes here",
                    "answer": "index of correct answer",
                    "options": [
                        "option 1",
                        "option 2",
                        "option 3",
                        "option 4"
                    ]
                }
            ]`;

    console.log('Sending request to Gemini for a chunk...');
    
    try {
      const result = await model.generateContent(prompt, generationConfig);
      let responseText = result.response.text();

      if (responseText.startsWith('```json') && responseText.endsWith('```')) {
        responseText = responseText.slice(7, -3).trim();
      }

      const parsedData = JSON.parse(responseText);
      allQuestions.push(...parsedData);
    } catch (error) {
      console.error("Error generating quiz from Gemini:", error);
    }
  }

  console.log('Final Array:', allQuestions);
};

const files = [
  'AnnexureCEmployeeNon-disclosureAgreementpdf',
  'Code_of_Conduct',
  'Darwinbox_Employee_Workplace_Access_Policy',
  'Darwinbox_Privacy_Policy_V.1.4_(2)',
  'Leave_and_Time-off_-_Intern.pdf',
  'Darwinbox-Information_Security_Objectives_V1.3',
  'Non-DisclosureAgreementpdf'
];

(async () => {
  for (let file of files) {
    const text = await readTextFromHRDoc(`./HR_Docs/${file}.pdf`);
    if (text) {
      await generateMCQQuizFromPDF(text);
    }
  }
})();
