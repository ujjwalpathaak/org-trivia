import { pipeline } from "@xenova/transformers";

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    let dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    let magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    let magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Function to remove similar headlines
async function removeSimilarHeadlines(headlines, threshold = 0.75) {
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

// Example usage
const headlines = [
    "Darwinbox launches native payroll solutions in The Philippines - adobo Magazine",
    "Darwinbox introduces Payroll in Philippines as part of SEA expansion - Philstar.com",
    "Darwinbox launches payroll platform in the Philippines - Backend News",
    "KKR holds talks for stake in HRtech firm Darwinbox - The Arc",
    "Konverz AI: Reimagining Workforce Management with HR Tech - ETHRWorld.com",
    "Europe Human Resource (HR) Technology Market 2025 - Key Growth - openPR",
    "HR Technology Solution - How Employer Solved Payroll Problem - Hr Morning",
    "Open now: How to enter Top HR Tech Products of the Year 2025 - Human Resource Executive®",
    "Meet the 2022 Top 100 HR Tech Influencers - Human Resource Executive®",
    "HR Tech Newsletter: Subscribe Now - Human Resource Executive®",
    "Meet HR Tech Startups Modernising India’s Back Offices - Inc42 Media",
    "HR Tech Awards: Now Open for 2025 Submissions! - Unleash"
];

removeSimilarHeadlines(headlines).then(filtered => console.log(filtered));
