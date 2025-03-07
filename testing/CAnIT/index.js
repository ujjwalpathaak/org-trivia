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

import { pipeline } from "@xenova/transformers";

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    let dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    let magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    let magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Function to remove similar headlines
async function removeSimilarHeadlines(headlines, threshold = 0.8) {
    const model = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    // Generate embeddings
    const embeddings = await Promise.all(
        headlines.map(async (headline) => {
            const output = await model(headline, { pooling: "mean", normalize: true });
            return output.data;
        })
    );

    const uniqueHeadlines = [];
    const seenEmbeddings = [];

    for (let i = 0; i < embeddings.length; i++) {
        let isSimilar = seenEmbeddings.some(seenEmb => 
            cosineSimilarity(embeddings[i], seenEmb) > threshold
        );

        if (!isSimilar) {
            uniqueHeadlines.push(headlines[i]);
            seenEmbeddings.push(embeddings[i]);
        }
    }

    return uniqueHeadlines;
}


async function fetchNews(query) {
  try {
    const rssUrl = 'https://news.google.com/rss/search?q=' + query;
    const feed = await parser.parseURL(rssUrl);

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - days);

    let recentNews = feed.items
      .filter((entry) => new Date(entry.pubDate) >= oneMonthAgo)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return recentNews.map((curr, index) => {
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

const countryOfOrg = 'India';
const latestNewsOrg = await fetchNews(`Google ${countryOfOrg}`);
const latestNewsIndustry = await fetchNews(
  `Technology ${countryOfOrg}`,
);
removeSimilarHeadlines([...latestNewsOrg, ...latestNewsIndustry]).then(filtered => console.log(filtered));
