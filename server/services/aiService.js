import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { MASTER_ROADMAP, getNextTopicForSubject } from '../data/masterRoadmap.js';

const AI_UNAVAILABLE_MSG = 'AI Teacher is currently unavailable. Please try again later.';

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to call Gemini with retries on rate limit (429) and model fallback
async function callGeminiWithRetry(prompt, retries = 2) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  const genAI = new GoogleGenerativeAI(geminiKey);
  const models = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

  for (const m of models) {
    const model = genAI.getGenerativeModel({ model: m });

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return text;
        }
      } catch (e) {
        if (e.message && e.message.includes('429')) {
          console.warn(`⚠️ Gemini API 429 Rate Limit on model ${m} (Attempt ${attempt}/${retries}). Retrying...`);
          if (attempt < retries) {
            await sleep(2000 * attempt);
            continue;
          }
        }
        console.error(`Gemini API Error with model ${m}:`, e.message);
        break;
      }
    }
  }
  return null;
}

// 1. Single Unified Daily Lesson Generator (1 LLM Request Per Day for All Modules)
export async function generateUnifiedDailyLesson(completedTopicsMap = {}, historyWords = []) {
  const openaiKey = process.env.OPENAI_API_KEY;

  const subjects = Object.keys(MASTER_ROADMAP);
  const targetTopics = [];

  for (const subject of subjects) {
    const completedForSubject = completedTopicsMap[subject] || [];
    const nextInfo = getNextTopicForSubject(subject, completedForSubject);
    if (nextInfo) {
      targetTopics.push({
        subject,
        topicName: nextInfo.topicName,
        topicIndex: nextInfo.topicIndex,
        totalTopics: nextInfo.totalTopics
      });
    }
  }

  const excludedWordsStr = historyWords.length > 0 ? historyWords.slice(-60).join(', ') : 'None';

  const prompt = `Generate today's complete, unified AI educational lesson bundle for candidate software engineering placement preparation.

1. English Vocabulary: 10 placement-focused corporate/technical words. DO NOT use: [${excludedWordsStr}].
2. Core CS Subjects: 1 topic lesson for EACH of these 10 target subjects & topics:
${JSON.stringify(targetTopics, null, 2)}
3. Interview Revision: 3 high-yield software engineering interview questions with model answers based on these subjects.

Respond STRICTLY with a single JSON object containing:
{
  "englishWords": [
    {
      "id": "eng_1",
      "word": "string",
      "pronunciation": "string",
      "meaning": "string",
      "synonyms": ["string"],
      "example": "string",
      "corporateUsage": "string",
      "interviewUsage": "string",
      "difficulty": "Intermediate",
      "category": "Corporate Communication"
    }
  ],
  "csTopics": [
    {
      "id": "cs_1",
      "subject": "Object-Oriented Programming",
      "topicName": "What is OOP?",
      "difficulty": "Beginner",
      "readingTime": "5 mins",
      "definition": "string",
      "whyImportant": "string",
      "analogy": "string",
      "detailedExplanation": "string",
      "visualization": "string",
      "codeExample": "string",
      "interviewTips": "string",
      "commonInterviewQuestions": ["string"],
      "commonMistakes": "string",
      "memoryTricks": "string",
      "oneMinuteNotes": "string",
      "quiz": {
        "question": "string",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "string"
      }
    }
  ],
  "interviewQuestions": [
    {
      "id": "rev_q1",
      "category": "Technical CS Core",
      "question": "string",
      "sampleAnswer": "string",
      "frequency": "Asked in 90% of Tech Interviews"
    }
  ]
}`;

  if (openaiKey && openaiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a principal software engineering educator. Return JSON object." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      const data = JSON.parse(response.choices[0].message.content);
      if (data.englishWords && data.csTopics) return data;
    } catch (e) {
      console.error('OpenAI Unified Lesson generation failed:', e.message);
    }
  }

  const geminiText = await callGeminiWithRetry(prompt);
  if (geminiText) {
    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.englishWords || parsed.csTopics) return parsed;
    }
  }

  throw new Error(AI_UNAVAILABLE_MSG);
}

// 2. Evaluate Practice Sentence using AI
export async function evaluateSentence(word, sentence) {
  if (!sentence || sentence.trim().length === 0) {
    throw new Error('Sentence cannot be empty.');
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  const prompt = `Evaluate the following sentence written by a candidate using the English word "${word}" for a technical placement interview context.
Sentence: "${sentence}"

Respond STRICTLY in JSON format with these exact keys:
{
  "grammarScore": number (out of 10),
  "vocabScore": number (out of 10),
  "structureScore": number (out of 10),
  "naturalnessScore": number (out of 10),
  "confidenceScore": number (out of 10),
  "overallScore": number (out of 10),
  "correctedSentence": "string",
  "explanation": "string",
  "betterAlternative": "string",
  "feedbackTags": ["string"],
  "fluencyAnalysis": "string explaining tone, vocabulary choice, and corporate readiness",
  "confidenceFeedback": "string with constructive advice on speaking and writing confidence"
}`;

  if (openaiKey && openaiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert English interview coach evaluating software engineering candidates. Return JSON object." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.error('OpenAI sentence evaluation failed:', e.message);
    }
  }

  const geminiText = await callGeminiWithRetry(prompt);
  if (geminiText) {
    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  }

  throw new Error(AI_UNAVAILABLE_MSG);
}

// 3. Evaluate Technical / HR Interview Answer using AI
export async function evaluateInterviewAnswer(question, answer, category) {
  if (!answer || answer.trim().length === 0) {
    throw new Error('Answer cannot be empty.');
  }

  const openaiKey = process.env.OPENAI_API_KEY;

  const prompt = `Evaluate the software engineering candidate answer for the ${category} question: "${question}".
Candidate Answer: "${answer}"

Return JSON format with keys:
{
  "correctnessScore": number (out of 10),
  "confidenceScore": number (out of 10),
  "grammarScore": number (out of 10),
  "communicationScore": number (out of 10),
  "technicalDepthScore": number (out of 10),
  "overallScore": number (out of 10),
  "feedback": "string",
  "improvedAnswer": "string using STAR method or clear technical structure",
  "followUpQuestion": "string",
  "suggestions": ["string"]
}`;

  if (openaiKey && openaiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a principal software engineering technical interviewer. Return JSON object." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.error('OpenAI interview evaluation failed:', e.message);
    }
  }

  const geminiText = await callGeminiWithRetry(prompt);
  if (geminiText) {
    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  }

  throw new Error(AI_UNAVAILABLE_MSG);
}
