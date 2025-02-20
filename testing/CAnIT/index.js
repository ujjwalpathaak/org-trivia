dotenv.config();
import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

import Praser from 'rss-parser'
const parser = new Praser();

const days = 30;

async function fetchNews(query) {
  try {
    const rssUrl = "https://news.google.com/rss/search?q=" + query;
    const feed = await parser.parseURL(rssUrl);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - days);

    let recentNews = feed.items
      .filter((entry) => new Date(entry.pubDate) >= oneMonthAgo)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const uniqueNews = [];
    const seenTitles = new Set();

    for (const entry of recentNews) {
      const normalizedTitle = entry.title.toLowerCase().trim();

      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueNews.push(entry);
      }
    }

    if (uniqueNews.length === 0) {
      console.log("No unique news found in the last 1 month.");
      return;
    }

    return uniqueNews.map((curr, index) => {
      return { title: curr.title, link: curr.link };
    });

  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
}

const generateMCQQuizFromPDF = async (pdfText) => {
  console.log(pdfText)
    const chunkSize = 10000;
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
        const prompt = `Generate a multiple-choice quiz based on the recent company news provided.
            - Carefully analyze the text to create questions that lets employees know about recent happenings.
            - Each question should have four answer choices, with one correct answer indicated.
            - Avoid overlapping questions all the questions will be part of the same quiz.
            - Make sure the People dont have access to Healdines while answers give context in questions itself if required.
            - Be carefull to filter negative news and any news which might not be suitable to ask employees from all kinds of domains.
            - Make the questions very general but make sure that they are not very easy too.

            News Chunk:
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

const latestNews = await fetchNews('TCS');
generateMCQQuizFromPDF(JSON.stringify(latestNews));