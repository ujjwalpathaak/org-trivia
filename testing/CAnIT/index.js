import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Praser from 'rss-parser';
const parser = new Praser();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

const days = 30;

async function fetchNews(query) {
  try {
    const rssUrl = 'https://news.google.com/rss/search?q=' + query;
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
      console.log('No unique news found in the last 1 month.');
      return;
    }

    return uniqueNews.map((curr, index) => {
      return `${curr.title}`;
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
  }
}

const generateMCQQuizFromNews = async (pdfText) => {
  const generationConfig = {
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
    maxOutputTokens: 1024,
    responseMimeType: 'application/json',
  };

  const prompt = `
        You are an HR professional creating 7 unique multiple-choice questions quiz for your companie's employees from the news I have given you. The quiz should be engaging and informative, ensuring employees stay updated on key developments.

        - Ensure that the questions are diverse and do not overlap in topic.
        - Each question should have four answer choices, with one correct answer.
        - The quiz should be challenging.
        - Avoid questions based on negative news or topics that may not be suitable for all employees.
        - Do not assume employees have direct access to the news headlines—frame the questions with sufficient context.

        News:
        ${pdfText}

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
        `;

  const result = await model.generateContent(prompt, generationConfig);
  let responseText = result.response.text();
  if (responseText.startsWith('```json') && responseText.endsWith('```')) {
    responseText = responseText.slice(7, -3).trim();
  }

  return [...JSON.parse(responseText)];
};

const latestNewsOrg = await fetchNews('Darwinbox');
console.log('latestNewsOrg: ', latestNewsOrg);
generateMCQQuizFromNews(JSON.stringify(latestNewsOrg));
const latestNewsIndustry = await fetchNews(
  'HRTech: Human Resources Technology',
);
console.log('latestNewsIndustry: ', latestNewsIndustry);
generateMCQQuizFromNews(JSON.stringify(latestNewsIndustry));
